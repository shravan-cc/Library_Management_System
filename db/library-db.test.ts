import { IBook } from '../article-management/models/book.model';
import { SimpleWhereExpression, WhereExpression } from '../libs/types';
import { AppEnvs } from '../read-env';
import { LibraryDataset } from './library-dataset';
import { Database } from './library-db';
import { MySQLAdapter } from './mysqldb';
import 'dotenv/config';

describe.skip('Database CRUD operations ', () => {
  const mySQLAdapter = new MySQLAdapter({ DbURL: AppEnvs.DATABASE_URL });
  const db = new Database<LibraryDataset>(mySQLAdapter);

  test('Select operation', async () => {
    const authorClause: SimpleWhereExpression<IBook> = {
      author: {
        op: 'CONTAINS',
        value: 'Sudha Murthy',
      },
    };
    const selectByAuthorClause = await db.select('books', [], authorClause);

    console.log(selectByAuthorClause);
  });
  test('Insert operation', async () => {
    const newBook = {
      title: 'Adventures of Huckleberry Finn',
      author: 'Mark Twain',
      publisher: 'Chatto & Windus',
      genre: 'Novel',
      isbnNo: '1234567890123',
      pages: 350,
      totalCopies: 10,
      availableCopies: 10,
    };
    await db.insert('books', newBook);
  });
  test('Update operation', async () => {
    const updateData: Partial<IBook> = {
      title: '',
    };
    const whereCondition: WhereExpression<IBook> = {
      author: { op: 'EQUALS', value: 'Mark Twain' },
    };
    await db.update('books', updateData, whereCondition);
  });

  test('Delete operation', async () => {
    const whereCondition: WhereExpression<IBook> = {
      author: { op: 'EQUALS', value: 'Mark Twain' },
    };
    await db.delete('books', whereCondition);
  });
});
