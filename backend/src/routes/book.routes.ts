import { Router } from 'express';
import { createBook, getBooks, getBookById, getGenres } from '../controllers/book.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/genres', getGenres);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', requireAuth, createBook);

export default router;
