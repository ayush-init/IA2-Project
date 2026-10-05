import { Router } from 'express';
import { createMember, getMembers, getMemberById, getMemberHistory } from '../controllers/member.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getMembers);
router.get('/:id/history', requireAuth, getMemberHistory);
router.get('/:id', requireAuth, getMemberById);
router.post('/', requireAuth, createMember);

export default router;
