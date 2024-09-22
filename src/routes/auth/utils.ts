import jwt from 'jsonwebtoken';

import {JWT_SECRET_KEY} from '@/config';
import {UnauthorizedError} from '@/utils/errors';
import {encode} from "hi-base32";
import crypto from "crypto";

export const createAccessToken = (id: string, email: string, name: string) => {
  const payload = {id, email, name};
  return jwt.sign(payload, JWT_SECRET_KEY, {expiresIn: '24h'});
};

export const createRefreshToken = (id: string, email: string, name: string) => {
  const payload = {id, email, name};
  return jwt.sign(payload, JWT_SECRET_KEY, {expiresIn: '360d'});
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY) as { id: string; email: string; name: string };
  } catch {
    throw new UnauthorizedError('Invalid token');
  }
};

export function generateBase32Secret(length = 32) {
  const buffer = crypto.randomBytes(length);

  return encode(buffer).replace(/=/g, "").substring(0, 24);
}

export const generateTOTPConfig = (otpSecret: string) => ({
  issuer: "expenses-tracker.com",
  label: "expenses-tracker",
  algorithm: "SHA1",
  digits: 6,
  secret: otpSecret,
});

export const extractNameFromEmail = (email: string) => {
  const username = email.split('@')[0];
  const formattedName = username.replace(/\./g, ' ');

  return formattedName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
