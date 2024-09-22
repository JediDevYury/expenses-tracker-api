import bcrypt from 'bcrypt';
import {eq} from 'drizzle-orm';
import OTPAuth from 'otpauth';

import db from '@/db';
import {users, totp} from '@/models/users';
import {ConflictError, UnauthorizedError} from '@/utils/errors';
import {extractNameFromEmail, generateTOTPConfig} from "@/routes/auth/utils";
import QRCode from "qrcode";

export const getUser = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user;
};

export const getTOTPByUserId = async (userId: string) => {
  const [totpRecord] = await db.select().from(totp).where(eq(totp.userId, userId)).limit(1);

  return totpRecord;
};

export const findTOTPSecretByUserId = async (userId: string) => {
  const result = await db.select().from(totp).where(eq(totp.userId, userId)).limit(1);

  return result.length ? result[0].otpSecret : null
};

export const verifyLogin = async (email: string, password: string) => {
  const user = await getUser(email);

  if (!user) throw new UnauthorizedError('Invalid username or password');

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordIsValid) throw new UnauthorizedError('Invalid username or password');

  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await getUser(email);

  if (!user) throw new UnauthorizedError('Invalid user email');

  return user;
}

export const setUserActive = async (userId: string, isActive: boolean) => {
  await db
    .update(users)
    .set({isActive})
    .where(eq(users.id, userId))
};

export const registerUser = async (email: string, password: string) => {
  const existingUser = await getUser(email);
  if (existingUser) throw new ConflictError('A user with that email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({email, name: extractNameFromEmail(email), passwordHash});

  const user = await getUser(email);

  if(!user) throw new UnauthorizedError('User not found');

  return user;
};

export const generateOtpAuthUrlAndSecret = async (userId: string) => {
  let otpSecret: string | null | undefined = await findTOTPSecretByUserId(userId);

  if (!otpSecret) {
    otpSecret = new OTPAuth.Secret({size: 20}).base32;

    await db
      .insert(totp)
      .values({userId, otpSecret, otpEnabled: true});
  }

  let totpInstance = new OTPAuth.TOTP(generateTOTPConfig(otpSecret));
  let otpAuthUrl = totpInstance.toString();

  const qrCode = await QRCode.toDataURL(otpAuthUrl);

  return {
    qrCode,
    otpSecret,
  }
};

export const verifyTOTP = async (userId: string, token: string) => {
  const totpRecord = await getTOTPByUserId(userId);

  if (!totpRecord) throw new UnauthorizedError('User does not have TOTP enabled');

  const totpInstance = new OTPAuth.TOTP(generateTOTPConfig(totpRecord.otpSecret));
  const isVerified = totpInstance.validate({token, window: 1}) === 0;

  if (!isVerified) throw new UnauthorizedError('Invalid 2FA token');

  await db.update(totp).set({otpVerified: isVerified}).where(eq(totp.userId, userId));

  return isVerified;
}

export const updateUserAvatar = async (userId: string, avatar: string) => {
  return db
    .update(users)
    .set({avatar})
    .where(eq(users.id, userId))
    .returning({avatar: users.avatar});
};
