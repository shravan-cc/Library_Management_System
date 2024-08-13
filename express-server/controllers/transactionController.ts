import { Request, Response } from 'express';
import { TransactionRepository } from '../../transaction-management/transaction.repository';
import { ITransactionBase } from '../../transaction-management/models/transaction.model'
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { AppEnvs } from '../../read-env'; 

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const transactionRepo = new TransactionRepository(db);

export const getTransactionByIdHandler = async (
  req: Request,
  res: Response
) => {
  const transactionId = parseInt(req.params.id, 10);

  if (isNaN(transactionId)) {
    return res.status(400).json({ error: 'Invalid transaction ID' });
  }

  try {
    const transaction = await transactionRepo.getById(transactionId);
    if (transaction) {
      res.status(200).json(transaction);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error handling transaction request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const listTransactionsHandler = async (req: Request, res: Response) => {
  const { offset = 0, limit = 10 } = req.query;
  const pageRequest = {
    offset: parseInt(offset as string, 10),
    limit: parseInt(limit as string, 10),
  };

  try {
    const transactions = await transactionRepo.list(pageRequest);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createTransactionHandler = async (req: Request, res: Response) => {
  const transactionData: ITransactionBase = req.body;

  try {
    const newTransaction = await transactionRepo.create(transactionData);
    res.status(201).json({ message: 'Transaction Created', newTransaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateTransactionHandler = async (req: Request, res: Response) => {
  const transactionId = parseInt(req.params.id, 10);
  const { returnDate } = req.body;

  if (isNaN(transactionId) || !returnDate) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const updatedTransaction = await transactionRepo.update(
      transactionId,
      returnDate
    );
    if (updatedTransaction) {
      res
        .status(200)
        .json({ message: 'Transaction Updated', updatedTransaction });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
