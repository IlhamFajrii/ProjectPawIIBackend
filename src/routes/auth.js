import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

export default Router()
  .post('/register', register)
  .post('/login', login)
  .get('/me', requireAuth, me);
