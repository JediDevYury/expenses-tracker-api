import { Router } from 'express';

import {
  generateOtpAuthUrlAndSecret,
  getUserByEmail,
  registerUser,
  setUserActive,
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
    const { email, password } = req.body;

    const user = await registerUser(email, password);

    const {
      qrCode,
      otpSecret
    } = await generateOtpAuthUrlAndSecret(user.id);

    res.status(200).send({
      email,
      qrCode,
      otpSecret,
    })
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

    if(user.isActive) {
      res.status(200).send({
        email: user.email,
      })

      return;
    }

    const {
      qrCode,
      otpSecret
    } = await generateOtpAuthUrlAndSecret(user.id);

    res.status(200).send({
      email,
      qrCode,
      otpSecret,
    })
  } catch (error) {
    next(error);
  }
});

router.post('/verify-2fa', async (req, res, next) => {
  try {
    const { email, token } = req.body;

    const user = await getUserByEmail(email);

    await verifyTOTP(user.id, token);

    if (!user.isActive) {
      await setUserActive(user.id, true);
    }

    const accessToken = createAccessToken(user.id, user.email, user.name);
    const refreshToken = createRefreshToken(user.id, user.email, user.name);

    res.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-2fa', async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await getUserByEmail(email);
    const {
      qrCode,
      otpSecret
    } = await generateOtpAuthUrlAndSecret(user.id);

    if(user.isActive) {
      await setUserActive(user.id, false);
    }

    res.status(200).send({ qrCode, otpSecret });
  } catch (error) {
    next(error);
  }
});

router.get('/sign-out', authenticateUser, async (_, res, next) => {
  try {
    res.status(200).send({ message: 'Successfully signed out' });
  } catch (error) {
    next(error);
  }
});

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
