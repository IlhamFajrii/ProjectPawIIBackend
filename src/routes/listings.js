import { Router } from 'express';
import * as listings from '../controllers/listingController.js';
import { requireAuth } from '../middleware/auth.js';

export default Router()
  .get('/', listings.list)
  .get('/mine', requireAuth, listings.mine) // harus sebelum /:id
  .get('/:id', listings.detail)
  .post('/', requireAuth, listings.create)
  .put('/:id', requireAuth, listings.update)
  .delete('/:id', requireAuth, listings.remove);
