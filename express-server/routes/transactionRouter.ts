import express from 'express';
import {
  getTransactionByIdHandler,
  listTransactionsHandler,
  issueBookHandler,
  returnBookHandler,
} from '../controllers/transactionController';
import {
  validateTransactionDataMiddleware,
  verifyAdminMiddleware,
} from '../middleware/middleware';

const transactionRouter = express.Router();

transactionRouter.get('/', verifyAdminMiddleware, listTransactionsHandler);
transactionRouter.get('/:id', verifyAdminMiddleware, getTransactionByIdHandler);
transactionRouter.post(
  '/',
  validateTransactionDataMiddleware,
  issueBookHandler
);
transactionRouter.patch('/:id', returnBookHandler);

export default transactionRouter;
