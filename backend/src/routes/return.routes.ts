import { Router } from 'express';
import { returnBook } from '../controllers/return.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/:borrowId', requireAuth, returnBook);

export default router;
