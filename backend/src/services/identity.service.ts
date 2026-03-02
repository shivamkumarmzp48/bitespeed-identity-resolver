import { pool } from '../database/db';
import { Contact, IdentifyRequest } from '../types';

export class IdentityService {
  async findOrCreateContacts(req: IdentifyRequest): Promise<{ primary: Contact; secondaries: Contact[] }> {
    const { email, phoneNumber } = req;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Find all contacts that match either email or phone (including soft-deleted? No, ignore deleted)
      const existingContacts = await this.findExistingContacts(client, email, phoneNumber);

      if (existingContacts.length === 0) {
        // No existing contact, create new primary
        const newContact = await this.createContact(client, {
          email,
          phoneNumber,
          linkPrecedence: 'primary',
        });
        await client.query('COMMIT');
        return { primary: newContact, secondaries: [] };
      }

      // Determine primary contact (oldest primary)
      let primary = existingContacts.find(c => c.linkPrecedence === 'primary' && c.linkedId === null);
      if (!primary) {
        // This shouldn't happen if data is consistent, but fallback: oldest contact
        primary = existingContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
      }

      // Collect all linked contacts (including the primary itself)
      const allLinked = await this.getAllLinkedContacts(client, primary.id);
      const secondaries = allLinked.filter(c => c.id !== primary.id);

      // Check if incoming request brings new info (email or phone not present in linked set)
      const existingEmails = new Set(allLinked.map(c => c.email).filter(Boolean));
      const existingPhones = new Set(allLinked.map(c => c.phoneNumber).filter(Boolean));

      const newInfo = (email && !existingEmails.has(email)) || (phoneNumber && !existingPhones.has(phoneNumber));

      if (newInfo) {
        // Create a secondary contact linked to primary
        const secondary = await this.createContact(client, {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: primary.id,
          linkPrecedence: 'secondary',
        });
        secondaries.push(secondary);
      } else {
        // No new info, but we still need to ensure primary is correct if there are multiple primaries
        // This case handles merging two primaries: if we have another primary in the list, we need to demote it.
        const otherPrimaries = existingContacts.filter(c => c.linkPrecedence === 'primary' && c.id !== primary.id);
        for (const other of otherPrimaries) {
          await this.updateContactToSecondary(client, other.id, primary.id);
          // Also update all contacts linked to that other primary to now link to the main primary
          const linkedToOther = await this.getAllLinkedContacts(client, other.id);
          for (const linked of linkedToOther) {
            if (linked.id !== other.id) {
              await this.updateContactLinkedId(client, linked.id, primary.id);
            }
          }
          // Add the demoted primary and its linked to secondaries list (they will be fetched again)
        }
        // After updates, refetch all linked to primary
        const updatedAll = await this.getAllLinkedContacts(client, primary.id);
        secondaries.length = 0;
        secondaries.push(...updatedAll.filter(c => c.id !== primary.id));
      }

      await client.query('COMMIT');

      return { primary, secondaries };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async findExistingContacts(client: any, email?: string, phoneNumber?: string): Promise<Contact[]> {
    const conditions = [];
    const params: any[] = [];
    if (email) {
      conditions.push(`email = $${params.length + 1}`);
      params.push(email);
    }
    if (phoneNumber) {
      conditions.push(`phone_number = $${params.length + 1}`);
      params.push(phoneNumber);
    }
    if (conditions.length === 0) return [];

    const query = `
      SELECT * FROM contacts 
      WHERE (${conditions.join(' OR ')}) AND deleted_at IS NULL
      ORDER BY created_at ASC
    `;
    const result = await client.query(query, params);
    return result.rows.map(this.mapRowToContact);
  }

  private async getAllLinkedContacts(client: any, primaryId: number): Promise<Contact[]> {
    const query = `
      WITH RECURSIVE contact_tree AS (
        SELECT * FROM contacts WHERE id = $1 AND deleted_at IS NULL
        UNION
        SELECT c.* FROM contacts c
        INNER JOIN contact_tree ct ON c.linked_id = ct.id
        WHERE c.deleted_at IS NULL
      )
      SELECT * FROM contact_tree;
    `;
    const result = await client.query(query, [primaryId]);
    return result.rows.map(this.mapRowToContact);
  }

  private async createContact(client: any, data: {
    email?: string | null;
    phoneNumber?: string | null;
    linkedId?: number | null;
    linkPrecedence: 'primary' | 'secondary';
  }): Promise<Contact> {
    const { email, phoneNumber, linkedId, linkPrecedence } = data;
    const result = await client.query(
      `INSERT INTO contacts (email, phone_number, linked_id, link_precedence, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [email || null, phoneNumber || null, linkedId || null, linkPrecedence]
    );
    return this.mapRowToContact(result.rows[0]);
  }

  private async updateContactToSecondary(client: any, id: number, newLinkedId: number): Promise<void> {
    await client.query(
      `UPDATE contacts SET link_precedence = 'secondary', linked_id = $1, updated_at = NOW() WHERE id = $2`,
      [newLinkedId, id]
    );
  }

  private async updateContactLinkedId(client: any, id: number, newLinkedId: number): Promise<void> {
    await client.query(
      `UPDATE contacts SET linked_id = $1, updated_at = NOW() WHERE id = $2`,
      [newLinkedId, id]
    );
  }

  private mapRowToContact(row: any): Contact {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      email: row.email,
      linkedId: row.linked_id,
      linkPrecedence: row.link_precedence,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}