import {
  ITransaction,
  ITransactionBase,
  RTransaction,
} from './models/transaction.model';
import { ITransactionRepository } from '../core/repository';
import { LibraryDataset } from '../db/library-dataset';
import { IPagedResponse, IPageRequest } from '../core/pagination.response';
import { MySQLDatabase } from '../db/library-db';

export class TransactionRepository
  implements ITransactionRepository<ITransactionBase, ITransaction>
{
  constructor(private readonly db: MySQLDatabase<LibraryDataset>) {}

  async issueBook(data: ITransactionBase): Promise<ITransaction> {
    const transaction: Omit<ITransaction, 'id'> = {
      ...data,
      status: 'Not returned',
    };
    const result = await this.db.insert('transactions', transaction);
    const insertedTransaction = await this.getById(result.insertId);

    if (!insertedTransaction) {
      throw new Error('Failed to retrieve the newly inserted transaction');
    }
    return insertedTransaction;
  }

  async getById(id: number): Promise<ITransaction | null> {
    const result = await this.db.select('transactions', [], {
      id: { op: 'EQUALS', value: id },
    });
    return result[0] || null;
  }

  async returnBook(
    transactionId: number,
    returnDate: string
  ): Promise<ITransaction | null> {
    const result = await this.db.update(
      'transactions',
      {
        returnDate: returnDate,
        status: 'Returned',
      },
      {
        id: {
          op: 'EQUALS',
          value: transactionId,
        },
        status: {
          op: 'EQUALS',
          value: 'Not Returned',
        },
      }
    );
    const updatedTransaction = await this.getById(transactionId);

    if (!updatedTransaction) {
      throw new Error('Failed to retrieve the newly updated transaction');
    }
    return updatedTransaction;
  }
  async list(params: IPageRequest): Promise<IPagedResponse<ITransactionBase>> {
    try {
      const transactions = await this.db.select(
        'transactions',
        [],
        {},
        { offset: params.offset, limit: params.limit }
      );
      const totalTransactions = await this.db.count('transactions', {});

      return {
        items: transactions,
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalTransactions,
        },
      };
    } catch (error) {
      console.error('Error listing transactions:', error);
      throw new Error('Failed to list transactions');
    }
  }
}
