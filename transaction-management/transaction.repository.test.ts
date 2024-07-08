import { describe, beforeEach, test, expect, beforeAll } from 'vitest';
import { TransactionRepository } from './transaction.repository';
import { ITransaction, ITransactionBase } from './models/transaction.model';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { join } from 'path';
import { formatDate } from '../core/utils';

describe('Tests for TransactionRepository class methods', () => {
  let transactionRepository: TransactionRepository;
  let transactionData: ITransactionBase;
  let db: Database<LibraryDataset>;

  beforeAll(async () => {
    db = new Database(join(__dirname, './data/dbtest.json'));
    await db.clear();
  });

  beforeEach(async () => {
    transactionRepository = new TransactionRepository(db);
    transactionData = {
      memberId: 1,
      bookId: 1,
      borrowDate: formatDate(new Date()),
      dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days later
    };
  });

  test('Tests for issuing a book', async () => {
    const createdTransaction = await transactionRepository.issueBook(
      transactionData
    );
    expect(createdTransaction).toEqual({
      ...transactionData,
      transactionId: 1,
      status: 'Not returned',
    });
    expect(createdTransaction).toBeDefined();
  });

  test('Tests for returning a book', async () => {
    const createdTransaction = await transactionRepository.issueBook(
      transactionData
    );
    const returnDate = formatDate(new Date());
    const returnedTransaction = await transactionRepository.returnBook(
      createdTransaction.transactionId,
      returnDate
    );

    expect(returnedTransaction).toEqual({
      ...createdTransaction,
      returnDate: returnDate,
      status: 'Returned',
    });
  });

  test('Tests for returning a book with invalid transaction ID', async () => {
    const returnDate = formatDate(new Date());
    const returnedTransaction = await transactionRepository.returnBook(
      999,
      returnDate
    );
    expect(returnedTransaction).toBeNull();
  });

  test('Tests for getting a transaction by ID', async () => {
    const createdTransaction = await transactionRepository.issueBook(
      transactionData
    );
    const retrievedTransaction = await transactionRepository.getById(
      createdTransaction.transactionId
    );

    expect(retrievedTransaction).toEqual(createdTransaction);
  });

  test('Tests for listing transactions with pagination', async () => {
    const transactionData2: ITransactionBase = {
      memberId: 2,
      bookId: 2,
      borrowDate: formatDate(new Date()),
      dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days later
    };

    await transactionRepository.issueBook(transactionData);
    await transactionRepository.issueBook(transactionData2);

    const result = await transactionRepository.list({ offset: 0, limit: 10 });
    expect(result.pagination.total).toBe(5);
    expect(result.items.length).toBe(5);
  });
});
