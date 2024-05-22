import jwt from 'jsonwebtoken';

import { JWT_SECRET_KEY } from '@/config';
import { UnauthorizedError } from '@/utils/errors';

export const createAccessToken = (id: string, email: string, name: string) => {
  const payload = { id, email, name };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '24h' });
  return token;
};

export const createRefreshToken = (id: string, email: string, name: string) => {
  const payload = { id, email, name };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '360d' });
  return token;
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY) as { id: string; email: string; name: string };
  } catch {
    throw new UnauthorizedError('Invalid token');
  }
};
