import express, { Router } from 'express';
import { draft } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';

// Batas besar hanya di rute ini, dan body baru dibaca setelah token lolos.
export default Router().post('/draft-listing', requireAuth, express.json({ limit: '4.3mb' }), draft);
