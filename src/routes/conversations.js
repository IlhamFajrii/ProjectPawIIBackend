import { Router } from 'express';
import * as conversations from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/auth.js';

export default Router()
  .use(requireAuth)
  .post('/', conversations.start)
  .get('/', conversations.list)
  .get('/:id/messages', conversations.messages)
  .post('/:id/messages', conversations.send);
