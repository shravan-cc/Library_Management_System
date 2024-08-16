import express from 'express';
import {
  getBookByIdHandler,
  listBooksHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} from '../controllers/bookController';
import {
  validateBookDataMiddleware,
  verifyAdminMiddleware,
} from '../middleware/middleware';

const bookRouter = express.Router();

bookRouter.get('/', listBooksHandler);
bookRouter.get('/:id', getBookByIdHandler);
bookRouter.post(
  '/',
  verifyAdminMiddleware,
  validateBookDataMiddleware,
  createBookHandler
);
bookRouter.patch(
  '/:id',
  verifyAdminMiddleware,
  validateBookDataMiddleware,
  updateBookHandler
);
bookRouter.delete('/:id', verifyAdminMiddleware, deleteBookHandler);

export default bookRouter;
