import express from 'express';
import {
  getTransactionByIdHandler,
  listTransactionsHandler,
  createTransactionHandler,
  updateTransactionHandler,
} from '../controllers/transactionController';
import { validateTransactionDataMiddleware } from '../middleware/middleware'; 

const transactionRouter = express.Router();

transactionRouter.get('/', listTransactionsHandler);
transactionRouter.get('/:id', getTransactionByIdHandler);
transactionRouter.post(
  '/',
  validateTransactionDataMiddleware,
  createTransactionHandler
);
transactionRouter.patch(
  '/:id',
  validateTransactionDataMiddleware,
  updateTransactionHandler
);

export default transactionRouter;
