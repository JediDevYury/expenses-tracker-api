import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import OTPAuth from 'otpauth';

import db from '@/db';
import { users, totp } from '@/models/users';
import { ConflictError, UnauthorizedError } from '@/utils/errors';
import {generateBase32Secret, generateTOTPConfig} from "@/routes/auth/utils";

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
  const otpSecret = result.length ? result[0].otpSecret : null
  return otpSecret;
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

export const registerUser = async (email: string, password: string, name: string) => {
  const existingUser = await getUser(email);
  if (existingUser) throw new ConflictError('A user with that email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({ email, name, passwordHash });
};

export const generateOtpAuthUrlAndSecret = async (userId: string) => {
  let otpSecret: string | null | undefined = await findTOTPSecretByUserId(userId);

  if(!otpSecret) {
    otpSecret = generateBase32Secret();

    await db
      .insert(totp)
      .values({ userId, otpSecret, otpEnabled: true });
  }

  let totpInstance = new OTPAuth.TOTP(generateTOTPConfig(otpSecret));
  let otpAuthUrl = totpInstance.toString();

  return {
    otpAuthUrl,
    otpSecret,
  }
};

export const verifyTOTP = async (userId: string, token: string) => {
  const totpRecord = await getTOTPByUserId(userId);

  if(!totpRecord) throw new UnauthorizedError('User does not have TOTP enabled');

  let totpInstance = new OTPAuth.TOTP(generateTOTPConfig(totpRecord.otpSecret));

  const isVerified = totpInstance.validate({ token, window: 1 }) === 0;

  await db.update(totp).set({ otpVerified: isVerified }).where(eq(totp.userId, userId));

  return isVerified;
}

export const updateUserAvatar = async (userId: string, avatar: string) => {
  return await db
    .update(users)
    .set({ avatar })
    .where(eq(users.id, userId))
    .returning({ avatar: users.avatar });
};
