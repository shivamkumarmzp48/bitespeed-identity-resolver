import { IdentifyRequest } from '../types';

export const validateIdentifyRequest = (body: any): IdentifyRequest => {
  const { email, phoneNumber } = body;
  if (!email && !phoneNumber) {
    throw new Error('Either email or phoneNumber must be provided');
  }
  return {
    email: email ? String(email) : undefined,
    phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
  };
};