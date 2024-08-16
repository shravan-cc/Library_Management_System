import { Request, Response, NextFunction } from 'express';
import { IBook } from '../../article-management/models/book.model';
import { IMemberBase } from '../../member-management/models/member.model';
import { ITransactionBase } from '../../transaction-management/models/transaction.model';
import { request } from 'http';
import mysql from 'mysql2/promise';
import { MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import { MemberRepository } from '../../member-management/member.repository';
import { AppEnvs } from '../../read-env';
import { error } from 'console';
import { BookRepository } from '../../article-management/book.repository';

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const memberRepo = new MemberRepository(db);
const bookRepo = new BookRepository(db);

export const validateBookDataMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (request.method === 'POST' || request.method === 'PATCH') {
    const body = request.body;

    const isValidBook = (data: any): data is Omit<IBook, 'id'> => {
      return (
        typeof data.title === 'string' &&
        typeof data.author === 'string' &&
        typeof data.publisher === 'string' &&
        typeof data.genre === 'string' &&
        typeof data.isbnNo === 'string' &&
        typeof data.pages === 'number' &&
        typeof data.totalCopies === 'number'
      );
    };

    if (!isValidBook(body)) {
      return response.status(400).json({ error: 'Invalid book data format' });
    }
  }
  next();
};

export const validateMemberDataMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (request.method === 'POST' || request.method === 'PATCH') {
    const body = request.body;
    const isValidMember = (data: IMemberBase): data is IMemberBase => {
      return (
        typeof data.firstName === 'string' &&
        typeof data.lastName === 'string' &&
        typeof data.phone === 'number' &&
        typeof data.address === 'string' &&
        (data.role === 'admin' || data.role === 'user')
      );
    };

    if (!isValidMember(body)) {
      return response.status(400).json({ error: 'Invalid member data format' });
    }
  }
  next();
};

export const validateTransactionDataMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (request.method === 'POST' || request.method === 'PATCH') {
    const body: ITransactionBase = request.body;
    const isValidTransaction = (data: any): data is ITransactionBase => {
      return (
        typeof data.memberId === 'number' &&
        typeof data.bookId === 'number' &&
        typeof data.borrowDate === 'string' &&
        typeof data.dueDate === 'string'
      );
    };

    const foundUser = await memberRepo.getById(body.memberId);
    if (!foundUser) {
      return response
        .status(400)
        .json({ error: 'You are not a member.Please register' });
    }

    const foundBook = await bookRepo.getById(body.bookId);
    if (!foundBook) {
      return response.status(400).json({ error: 'Book is not available' });
    }

    if (!isValidTransaction(body)) {
      return response
        .status(400)
        .json({ error: 'Invalid transaction data format' });
    }
  }
  next();
};

export const verifyAdminMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const user = request.user;
  if (user.role !== 'admin') {
    return response.status(400).json({ error: 'Only admin can access' });
  }
  next();
};
