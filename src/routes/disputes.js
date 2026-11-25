import { Router } from 'express';
import * as disputes from '../controllers/disputeController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export default Router()
  .use(requireAuth)
  .get('/', disputes.list)
  .get('/:id', disputes.detail)
  .put('/:id/resolve', requireAdmin, disputes.resolve);
