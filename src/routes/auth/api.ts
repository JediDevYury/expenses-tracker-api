import { Router } from 'express';

import { registerUser, updateUserAvatar, verifyLogin } from './repository';
import { createAccessToken, createRefreshToken, verifyToken } from './utils';
import { upload } from '@/middlewares/upload';
import { authenticateUser } from '@/middlewares/authenticate-user';
import { UnauthorizedError } from '@/utils/errors';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    console.log('email', email, 'password', password, 'name', name, 'register')

    await registerUser(email, password, name);

    res.status(200).send({ message: 'Successfully signed up' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await verifyLogin(email, password);
    const accessToken = createAccessToken(user.id, user.email, user.name);
    const refreshToken = createRefreshToken(user.id, user.email, user.name);

    res.status(200).send({ accessToken, refreshToken });
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
