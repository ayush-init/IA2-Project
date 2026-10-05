import { Router } from 'express';
import { issueBook } from '../controllers/borrow.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, issueBook);

export default router;
