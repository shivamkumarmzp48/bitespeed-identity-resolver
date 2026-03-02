import { Request, Response } from 'express';
import { validateIdentifyRequest } from '../utils/validators';
import { IdentityService } from '../services/identity.service';
import { IdentifyResponse } from '../types';

const identityService = new IdentityService();

export const identify = async (req: Request, res: Response) => {
  try {
    const requestData = validateIdentifyRequest(req.body);
    const { primary, secondaries } = await identityService.findOrCreateContacts(requestData);

    const emails = [primary.email, ...secondaries.map(s => s.email)].filter(Boolean) as string[];
    const phoneNumbers = [primary.phoneNumber, ...secondaries.map(s => s.phoneNumber)].filter(Boolean) as string[];
    const secondaryContactIds = secondaries.map(s => s.id);

    const response: IdentifyResponse = {
      contact: {
        primaryContatctId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};