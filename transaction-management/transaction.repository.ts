import { ITransaction, ITransactionBase } from './models/transaction.model';
import { ITransactionRepository } from '../core/repository';
// import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';

export class TransactionRepository
  implements ITransactionRepository<ITransactionBase, ITransaction>
{
  constructor(private readonly db: Database<LibraryDataset>) {}
  private currentId = 0;
  private get transactions(): ITransaction[] {
    return this.db.table('transactions');
  }
  private generateId() {
    if (this.currentId >= 1) {
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
    returnDate: Date
  ): Promise<ITransaction | null> {
    const index = this.transactions.findIndex(
      (t) => t.transactionId === transactionId
    );
    if (index === -1) {
      return null;
    }
    this.transactions[index].returnDate = returnDate;
    return this.transactions[index];
  }
}
