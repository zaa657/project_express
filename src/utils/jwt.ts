import jwt, { type SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';
import type { JWTPayload } from '../types/auth';

export const signToken = (payload: JWTPayload, customExpiresIn?: string): string => {
  const options: SignOptions = {
    expiresIn: (customExpiresIn || ENV.JWT_EXPIRES_IN) as any
  };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    return decoded as JWTPayload;
  } catch {
    return null;
  }
};
