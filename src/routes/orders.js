import { Router } from 'express';
import { open } from '../controllers/disputeController.js';
import * as orders from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router()
  .use(requireAuth)
  .post('/', orders.create)
  .get('/', orders.list)
  .get('/:id', orders.detail)
  .post('/:id/dispute', open);

for (const action of ['pay', 'process', 'deliver', 'confirm', 'cancel']) {
  router.post(`/:id/${action}`, orders.transition(action));
}

export default router;
