import {
  ITransaction,
  ITransactionBase,
  RTransaction,
} from './models/transaction.model';
import { ITransactionRepository } from '../core/repository';
// import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { IPagedResponse, IPageRequest } from '../core/pagination.response';

export class TransactionRepository
  implements ITransactionRepository<ITransactionBase, ITransaction>
{
  constructor(private readonly db: Database<LibraryDataset>) {}
  private currentId = 0;
  private get transactions(): ITransaction[] {
    return this.db.table('transactions');
  }
  private generateId() {
    if (this.transactions.length >= 1) {
      this.currentId = Math.max(
        ...this.transactions.map((transaction) => transaction.transactionId)
      );
      this.currentId += 1;
      return this.currentId;
    }
    this.currentId = 1;
    return this.currentId;
  }
  async issueBook(data: ITransactionBase): Promise<ITransaction> {
    const id = this.generateId();
    const transaction: ITransaction = {
      ...data,
      transactionId: id,
      status: 'Not returned',
    };
    this.transactions.push(transaction);
    await this.db.save();
    return transaction;
  }

  async getById(id: number): Promise<ITransaction | null> {
    const transaction = this.transactions.find((t) => t.transactionId === id);
    return transaction || null;
  }

  async returnBook(
    transactionId: number,
    returnDate: string
  ): Promise<ITransaction | null> {
    const index = this.transactions.findIndex(
      (t) => t.transactionId === transactionId
    );
    if (index === -1) {
      return null;
    }
    if (this.transactions[index].status === 'Not returned') {
      this.transactions[index].returnDate = returnDate;
      this.transactions[index].status = 'Returned';
      return this.transactions[index];
    }
    return null;
  }
  async list(params: IPageRequest): Promise<IPagedResponse<ITransactionBase>> {
    return {
      items: this.transactions.slice(
        params.offset,
        params.offset + params.limit
      ),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: this.transactions.length,
      },
    };
  }
}
