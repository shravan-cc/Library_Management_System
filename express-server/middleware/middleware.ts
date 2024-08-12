import { Request, Response, NextFunction } from 'express';
import { IBook } from '../../article-management/models/book.model';
import { IMemberBase } from '../../member-management/models/member.model';

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
        typeof data.totalCopies === 'number' &&
        typeof data.availableCopies === 'number'
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
    const isValidMember = (data: any): data is IMemberBase => {
      return (
        typeof data.firstName === 'string' &&
        typeof data.lastName === 'string' &&
        typeof data.phone === 'number' &&
        typeof data.address === 'string'
      );
    };

    if (!isValidMember(body)) {
      return response.status(400).json({ error: 'Invalid member data format' });
    }
  }
  next();
};

