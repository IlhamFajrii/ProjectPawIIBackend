import { Router } from 'express';
import { token } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';

export default Router().post('/', requireAuth, token);
