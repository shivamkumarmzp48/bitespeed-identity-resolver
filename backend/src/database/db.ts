import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create ENUM type if it doesn't exist (safer approach)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'link_precedence') THEN
          CREATE TYPE link_precedence AS ENUM ('primary', 'secondary');
        END IF;
      END $$;
    `);

    // 2. Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create contacts table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20),
        email VARCHAR(255),
        linked_id INTEGER REFERENCES contacts(id),
        link_precedence link_precedence NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT at_least_one_contact CHECK (phone_number IS NOT NULL OR email IS NOT NULL)
      );
    `);

    // 4. Create indexes (IF NOT EXISTS is not standard for indexes, so we use a safe approach)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_contacts_linked_id ON contacts(linked_id) WHERE deleted_at IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};