import chalk from 'chalk';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { IRepository } from '../core/repository';
import { IBook, IBookBase } from './models/book.model';
import { PageOption, WhereExpression } from '../libs/types';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import 'dotenv/config';

const {
  generateCountSql,
  generateInsertSql,
  generateSelectSql,
  generateDeleteSql,
  generateUpdateSql,
} = MySqlQueryGenerator;

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private readonly factory: PoolConnectionFactory) {}

  async create(data: IBookBase): Promise<IBook> {
    const connection = await this.factory.acquirePoolConnection();
    try {
      const book: Omit<IBook, 'id'> = {
        ...data,
        availableCopies: data.totalCopies,
      };

      const { sql, values } = generateInsertSql<IBookBase>('books', book);
      const result = await connection.query<ResultSetHeader>(sql, values);
      const insertedBook = await this.getById(result.insertId);

      if (!insertedBook) {
        throw new Error('Failed to retrieve the newly inserted book');
      }

      return insertedBook;
    } catch (e: any) {
      throw new Error(`Insertion failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }

  async update(id: number, data: IBookBase): Promise<IBook | null> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const existingBook = await this.getById(id);
      if (!existingBook) {
        return null;
      }

      const updatedBook: IBook = {
        ...existingBook,
        ...data,
        availableCopies: data.totalCopies,
      };

      const { sql, values } = generateUpdateSql<IBook>('books', updatedBook, {
        id: { op: 'EQUALS', value: id },
      });
      await connection.query<ResultSetHeader>(sql, values);
      const editedBook = await this.getById(id);

      if (!editedBook) {
        throw new Error('Failed to retrieve the updated book');
      }

      await connection.commit();
      return editedBook;
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Update failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }

  async delete(id: number): Promise<IBook | null> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const existingBook = await this.getById(id);
      if (!existingBook) {
        return null;
      }

      const { sql, values } = generateDeleteSql<IBook>('books', {
        id: { op: 'EQUALS', value: id },
      });
      await connection.query<ResultSetHeader>(sql, values);
      await connection.commit();
      return existingBook;
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Deletion failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }

  async getById(id: number): Promise<IBook | null> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const { sql, values } = generateSelectSql<IBook>('books', [], {
        id: { op: 'EQUALS', value: id },
      });
      const [rows] = await connection.query<RowDataPacket[]>(sql, values);
      await connection.commit();
      return (rows as IBook) || null;
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Selection failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }

  async handleBook(id: number): Promise<boolean> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const existingBook = await this.getById(id);
      if (existingBook && existingBook.availableCopies > 0) {
        existingBook.availableCopies -= 1;
        const { sql, values } = generateUpdateSql<IBook>(
          'books',
          existingBook,
          { id: { op: 'EQUALS', value: id } }
        );
        await connection.query<ResultSetHeader>(sql, values);
        await connection.commit();
        console.log(chalk.greenBright('Book issued successfully.'));
        return true;
      }
      return false;
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Handling book failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }

  async returnBook(id: number): Promise<void> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const existingBook = await this.getById(id);
      if (existingBook) {
        existingBook.availableCopies += 1;
        const { sql, values } = generateUpdateSql<IBook>(
          'books',
          existingBook,
          { id: { op: 'EQUALS', value: id } }
        );
        await connection.query<ResultSetHeader>(sql, values);
        await connection.commit();
      }
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Return book failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }

  async list(params: IPageRequest): Promise<IPagedResponse<IBook>> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const search = params.search?.toLowerCase();
      let where: WhereExpression<IBook> = {};

      if (search) {
        where = {
          OR: [
            { title: { op: 'CONTAINS', value: search } },
            { isbnNo: { op: 'CONTAINS', value: search } },
          ],
        };
      }

      const pageOpts: PageOption = {
        offset: params.offset,
        limit: params.limit,
      };

      const { sql, values } = generateSelectSql<IBook>(
        'books',
        [],
        where,
        pageOpts
      );
      const books = await connection.query(sql, values);

      const countSqlData = generateCountSql('books', where);
      console.log(countSqlData.sql, countSqlData.values);
      const totalBooksRows = await connection.query(
        countSqlData.sql,
        countSqlData.values
      );
      const totalBooks = (totalBooksRows as any)[0].COUNT;
      console.log(totalBooks);

      await connection.commit();
      return {
        items: books as IBook[],
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalBooks,
        },
      };
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Listing books failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }
}
