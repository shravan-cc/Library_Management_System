import express from 'express';
import {
  getBookByIdHandler,
  listBooksHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} from '../controllers/bookController';
import {
  authorizeRoles,
  validateBookDataMiddleware,
} from '../middleware/middleware';

const bookRouter = express.Router();

bookRouter.get('/', listBooksHandler);
bookRouter.get('/:id', getBookByIdHandler);
bookRouter.post(
  '/',
  authorizeRoles('admin'),
  validateBookDataMiddleware,
  createBookHandler
);
bookRouter.patch('/:id',authorizeRoles('admin'), validateBookDataMiddleware, updateBookHandler);
bookRouter.delete('/:id',authorizeRoles('admin'), deleteBookHandler);

export default bookRouter;
