import chalk from 'chalk';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { IRepository } from '../core/repository';
import { LibraryDataset } from '../db/library-dataset';
import { IBook, IBookBase } from './models/book.model';
import { MySQLDatabase } from '../db/library-db';
import { PageOption, WhereExpression } from '../libs/types';

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private readonly db: MySQLDatabase<LibraryDataset>) {}

  async create(data: IBookBase): Promise<IBook> {
    const book: Omit<IBook, 'id'> = {
      ...data,
      availableCopies: data.totalCopies,
    };
    const result = await this.db.insert('books', book);
    const insertedBook = await this.getById(result.insertId);

    if (!insertedBook) {
      throw new Error('Failed to retrieve the newly inserted book');
    }
    return insertedBook;
  }

  async update(id: number, data: IBookBase): Promise<IBook | null> {
    const existingBook = await this.getById(id);
    if (!existingBook) {
      return null;
    }
    const updatedBook = {
      ...existingBook,
      ...data,
      availableCopies: data.totalCopies,
    };
    const result = await this.db.update('books', updatedBook, {
      id: { op: 'EQUALS', value: id },
    });
    const editedBook = await this.getById(id);
    if (!editedBook) {
      throw new Error('Failed to retrieve the newly edited book');
    }

    return editedBook;
  }

  async delete(id: number): Promise<IBook | null> {
    const existingBook = await this.getById(id);
    if (!existingBook) {
      return null;
    }
    await this.db.delete('books', { id: { op: 'EQUALS', value: id } });
    return existingBook;
  }

  async getById(id: number): Promise<IBook | null> {
    const result = await this.db.select('books', [], {
      id: { op: 'EQUALS', value: id },
    });
    return result[0] || null;
  }

  async handleBook(id: number): Promise<boolean> {
    const existingBook = await this.getById(id);
    if (existingBook && existingBook.availableCopies > 0) {
      existingBook.availableCopies -= 1;
      await this.db.update('books', existingBook, {
        id: { op: 'EQUALS', value: id },
      });
      console.log(chalk.greenBright('Book issued successfully.'));
      return true;
    }
    return false;
  }

  async returnBook(id: number): Promise<void> {
    const existingBook = await this.getById(id);
    if (existingBook) {
      existingBook.availableCopies += 1;
      await this.db.update('books', existingBook, {
        id: { op: 'EQUALS', value: id },
      });
    }
  }

  async list(params: IPageRequest): Promise<IPagedResponse<IBook>> {
    const search = params.search?.toLowerCase();
    let where: WhereExpression<IBook> = {};

    if (search) {
      where = {
        OR: [
          {
            title: { op: 'CONTAINS', value: search },
          },
          {
            isbnNo: { op: 'CONTAINS', value: search },
          },
        ],
      };
    }
    const pageOpts: PageOption = {
      offset: params.offset,
      limit: params.limit,
    };
    const books = await this.db.select('books', [], where, pageOpts);
    const totalBooks = await this.db.count('books', where);
    return {
      items: books,
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: totalBooks,
      },
    };
  }
}
