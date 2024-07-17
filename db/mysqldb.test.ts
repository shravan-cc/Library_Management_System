import { test, expect } from 'vitest';
import { MySQLAdapter } from './mysqldb';
import { AppEnvs } from '../read-env';
import 'dotenv/config';
import { SimpleWhereExpression } from '../libs/types';
import { IBook } from '../article-management/models/book.model';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
describe.skip('my sql db adapter tests', () => {
  const { generateSelectSql } = MySqlQueryGenerator;
  let mySQLAdapter: MySQLAdapter;
  beforeAll(async () => {
    mySQLAdapter = new MySQLAdapter({ DbURL: AppEnvs.DATABASE_URL });
  });

  test('run a select on books table', async () => {
    const authorClause: SimpleWhereExpression<IBook> = {
      author: {
        op: 'CONTAINS',
        value: 'Sudha Murthy',
      },
    };
    const selectByAuthorClause = generateSelectSql<IBook>(
      'books',
      [],
      authorClause
    );
    const result = await mySQLAdapter.runQuery(
      selectByAuthorClause.sql,
      selectByAuthorClause.values
    );
    console.log(result);
    // expect(selectByAuthor).toEqual(
    //   'SELECT * FROM `books` WHERE (`author` LIKE "%Sudha Murthy%")'
    // );
  });
});
