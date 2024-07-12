import { describe, expect, test } from 'vitest';
import { MySqlQueryGenerator } from './mysql-query-generator';
import {
  OrWhereExpression,
  SimpleWhereExpression,
  WhereExpression,
} from './types';
import { IBook, IBookBase } from '../article-management/models/book.model';
import exp from 'constants';
import { aC } from 'vitest/dist/reporters-yx5ZTtEV';

// Sample data for testing
const tableName = 'trainees';
const {
  generateWhereClauseSql,
  generateInsertSql,
  generateUpdateSql,
  generateDeleteSql,
  generateSelectSql,
  generateCountSql,
} = MySqlQueryGenerator;
interface UserFields {
  id: string;
  name: string;
  email: string;
  address: string;
  dob: string;
}

type InsertFields = Omit<UserFields, 'id'>;

describe('MySqlQueryGenerator', () => {
  test('generateInsertSql should generate correct SQL for insertion', () => {
    const row: InsertFields = {
      name: 'Vignesh',
      email: 'vignesh@codecraft.co.in',
      dob: '2001-12-28',
      address: 'Mangalore, Karnataka',
    };

    const expectedSql = `INSERT INTO \`${tableName}\` (\`name\`, \`email\`, \`dob\`, \`address\`) VALUES (?, ?, ?, ?)`;
    const expectedValues = [
      'Vignesh',
      'vignesh@codecraft.co.in',
      '2001-12-28',
      'Mangalore, Karnataka',
    ];
    const actualSql = MySqlQueryGenerator.generateInsertSql<InsertFields>(
      tableName,
      row
    );

    expect(actualSql.sql).toBe(expectedSql);
    expect(actualSql.values).toEqual(expectedValues);
  });

  test('generateUpdateSql should generate correct SQL for updating', () => {
    const row: Partial<UserFields> = {
      address: 'Kulshekar, Mangalore, Karnataka',
    };

    const where: WhereExpression<UserFields> = {
      OR: [
        {
          email: { op: 'EQUALS', value: 'vignesh@codecraft.co.in' },
          dob: { op: 'NOT_EQUALS', value: '2001-12-21' },
        },
        { dob: { op: 'EQUALS', value: '2001-12-25' } },
      ],
    };
    const expectedSql = `UPDATE \`${tableName}\` SET address = ? WHERE ((\`email\` = ? AND \`dob\` != ?) OR (\`dob\` = ?)) `;
    const expectedValues = [
      'Kulshekar, Mangalore, Karnataka',
      'vignesh@codecraft.co.in',
      '2001-12-21',
      '2001-12-25',
    ];
    const actualSql = MySqlQueryGenerator.generateUpdateSql<UserFields>(
      tableName,
      row,
      where
    );
    console.log(actualSql.sql);
    expect(actualSql.sql).toBe(expectedSql);
    expect(actualSql.values).toEqual(expectedValues);
  });

  test('generateDeleteSql should generate correct SQL for deletion', () => {
    const where: WhereExpression<UserFields> = {
      email: { op: 'EQUALS', value: 'vignesh@codecraft.co.in' },
    };

    const expectedSql = `DELETE FROM \`${tableName}\` WHERE (\`email\` = ?) `;
    const expectedValues = ['vignesh@codecraft.co.in'];
    const actualSql = MySqlQueryGenerator.generateDeleteSql<UserFields>(
      tableName,
      where
    );

    expect(actualSql.sql).toBe(expectedSql);
    expect(actualSql.values).toEqual(expectedValues);
  });

  test('generateSelectSql should generate correct SQL for selection', () => {
    const columns: (keyof UserFields)[] = ['id', 'name', 'email', 'dob'];
    const where: WhereExpression<UserFields> = {
      name: { op: 'EQUALS', value: 'Vignesh' },
    };

    // const offset: PageOption = 0;
    // const limit: PageOption = 1;

    const expectedSql = `SELECT \`id\`, \`name\`, \`email\`, \`dob\` FROM \`${tableName}\` WHERE (\`name\` = ?)`;
    const expectedValues = ['Vignesh'];
    const actualSql = MySqlQueryGenerator.generateSelectSql<UserFields>(
      tableName,
      columns,
      where
    );

    expect(actualSql.sql).toBe(expectedSql);
    expect(actualSql.values).toEqual(expectedValues);
  });

  test('generateCountSql should generate correct SQL for counting', () => {
    const where: WhereExpression<UserFields> = {
      email: { op: 'EQUALS', value: 'vignesh@codecraft.co.in' },
    };
    const expectedSql = `SELECT COUNT(*) AS 'COUNT' FROM ${tableName} WHERE (\`email\` = ?)`;
    const expectedValues = ['vignesh@codecraft.co.in'];
    const actualSql = MySqlQueryGenerator.generateCountSql<UserFields>(
      tableName,
      where
    );

    expect(actualSql.sql).toBe(expectedSql);
    expect(actualSql.values).toEqual(expectedValues);
  });
});

describe('Test SQL generator with queries on BOOK DB', () => {
  const author: SimpleWhereExpression<IBook> = {
    author: {
      op: 'CONTAINS',
      value: 'Sudha Murthy',
    },
  };

  const authAndPublisher: SimpleWhereExpression<IBook> = {
    author: {
      op: 'CONTAINS',
      value: 'Sudha Murthy',
    },
    publisher: {
      op: 'EQUALS',
      value: 'Penguin UK',
    },
  };

  const authAndPublisherOrCopies: OrWhereExpression<IBook> = {
    OR: [
      authAndPublisher,
      {
        totalCopies: {
          op: 'GREATER_THAN_EQUALS',
          value: 10,
        },
      },
    ],
  };

  const authOrPublisher: OrWhereExpression<IBook> = {
    OR: [
      {
        author: {
          op: 'CONTAINS',
          value: 'Sudha Murthy',
        },
      },
      {
        totalCopies: {
          op: 'GREATER_THAN_EQUALS',
          value: 10,
        },
      },
    ],
  };
  test('where clause generation', () => {
    // (`author` LIKE "%Sudha Murthy%")
    const authorClause = generateWhereClauseSql<IBook>(author);
    expect(authorClause.sql).toEqual('(`author` LIKE ?)');
    expect(authorClause.values).toEqual(['%Sudha Murthy%']);

    // (`author` LIKE "%Sudha Murthy%" AND `publisher` = "Penguin UK")
    const authAndPublisherClause =
      generateWhereClauseSql<IBook>(authAndPublisher);
    expect(authAndPublisherClause.sql).toEqual(
      '(`author` LIKE ? AND `publisher` = ?)'
    );
    expect(authAndPublisherClause.values).toEqual([
      '%Sudha Murthy%',
      'Penguin UK',
    ]);

    const authAndPublisherOrCopiesClause = generateWhereClauseSql<IBook>(
      authAndPublisherOrCopies
    );

    // ((`author` LIKE "%Sudha Murthy%" AND `publisher` = "Penguin UK") OR (`totalCopies` >= 10))
    expect(authAndPublisherOrCopiesClause.sql).toEqual(
      '((`author` LIKE ? AND `publisher` = ?) OR (`totalCopies` >= ?))'
    );
    expect(authAndPublisherOrCopiesClause.values).toEqual([
      '%Sudha Murthy%',
      'Penguin UK',
      10,
    ]);

    // ((`author` LIKE "%Sudha Murthy%") OR (`totalCopies` >= 10))
    const authOrPublisherClause =
      generateWhereClauseSql<IBook>(authOrPublisher);
    expect(authOrPublisherClause.sql).toEqual(
      '((`author` LIKE ?) OR (`totalCopies` >= ?))'
    );
    expect(authOrPublisherClause.values).toEqual(['%Sudha Murthy%', 10]);
  });

  test('select tests', () => {
    // SELECT * FROM `books` WHERE (`author` LIKE "%Sudha Murthy%")
    const selectByAuthor = generateSelectSql<IBook>('books', [], author);
    expect(selectByAuthor.sql).toEqual(
      'SELECT * FROM `books` WHERE (`author` LIKE ?)'
    );
    expect(selectByAuthor.values).toEqual(['%Sudha Murthy%']);

    //
    const selectAuthAndPublisherOrCopies = generateSelectSql<IBook>(
      'books',
      ['author', 'publisher', 'totalCopies'],
      authAndPublisherOrCopies
    );
    expect(selectAuthAndPublisherOrCopies.sql).toEqual(
      'SELECT `author`, `publisher`, `totalCopies` FROM `books` WHERE ((`author` LIKE ? AND `publisher` = ?) OR (`totalCopies` >= ?))'
    );
    expect(selectAuthAndPublisherOrCopies.values).toEqual([
      '%Sudha Murthy%',
      'Penguin UK',
      10,
    ]);
  });
});
