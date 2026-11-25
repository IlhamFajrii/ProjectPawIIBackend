import { Router } from 'express';
import { publicProfile, updateMe } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

export default Router()
  .put('/me', requireAuth, updateMe)
  .get('/:id', publicProfile);
