import { Router } from 'express';
import { createMember, getMembers, getMemberById } from '../controllers/member.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getMembers);
router.get('/:id', requireAuth, getMemberById);
router.post('/', requireAuth, createMember);

export default router;
