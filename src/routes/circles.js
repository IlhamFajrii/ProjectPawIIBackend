import { Router } from 'express';
import * as circles from '../controllers/circleController.js';
import { requireAuth } from '../middleware/auth.js';

export default Router()
  .use(requireAuth)
  .post('/', circles.create)
  .get('/mine', circles.mine)
  .post('/join', circles.join)
  .get('/:id', circles.detail)
  .delete('/:id/members/me', circles.leave)
  .post('/:id/vouches', circles.vouch)
  .delete('/:id/vouches/:userId', circles.unvouch);
