import { Router } from 'express';
import QRCode from 'qrcode';

import {
  generateOtpAuthUrlAndSecret,
  getUserByEmail,
  registerUser,
  updateUserAvatar,
  verifyLogin,
  verifyTOTP,
} from './repository';
import { createAccessToken, createRefreshToken, verifyToken } from './utils';
import { upload } from '@/middlewares/upload';
import { authenticateUser } from '@/middlewares/authenticate-user';
import { UnauthorizedError } from '@/utils/errors';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    await registerUser(email, password, name);

    res.status(200).send({ message: 'Successfully signed up' });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const { id, email, name } = verifyToken(refreshToken);
    const accessToken = createAccessToken(id, email, name);

    res.status(200).send({ accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await verifyLogin(email, password);
    const {
      otpAuthUrl,
      otpSecret
    } = await generateOtpAuthUrlAndSecret(user.id);
    const qrUrl = await QRCode.toDataURL(otpAuthUrl);

    res.status(200).send({
      qrCodeUrl: qrUrl,
      secret: otpSecret,
      email: user.email,
    })
  } catch (error) {
    next(error);
  }
});

router.post('/verify-2fa', async (req, res, next) => {
  try {
    const { email, token } = req.body;

    const user = await getUserByEmail(email);
    const isVerified = await verifyTOTP(user.id, token);

    if (!isVerified) throw new UnauthorizedError('Invalid 2FA token');

    const accessToken = createAccessToken(user.id, user.email, user.name);
    const refreshToken = createRefreshToken(user.id, user.email, user.name);

    res.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
})

router.post('/:userId/upload', authenticateUser, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file || Object.keys(req.file).length === 0) {
      return res.status(400).send('No file was uploaded.');
    }

    const userId = req.user.id;
    const paramId = req.params.userId;

    if (userId !== paramId) throw new UnauthorizedError('Cannot upload avatar for another user');

    const uploadPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const updatedUser = await updateUserAvatar(userId, uploadPath);

    res.status(200).send({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});

export default router;
