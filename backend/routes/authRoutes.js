import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/check', checkAuth);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;