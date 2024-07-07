import chalk from 'chalk';
import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { TransactionRepository } from './transaction.repository';
import { z } from 'zod';
import { BookRepository } from '../article-management/book.repository';
import { MemberRepository } from '../member-management/member.repository';
import { promptForValidInput } from '../core/input.utils';
import {
  ITransactionBase,
  transactionBaseSchema,
  RTransaction,
  returnSchema,
} from './models/transaction.model';
import { formatDate } from '../core/utils';

const menu = new Menu([
  { key: '1', label: 'Issue A Book' },
  { key: '2', label: 'Return A Book' },
  { key: '3', label: 'Display Transaction' },
  { key: '4', label: '<Previous Menu>' },
]);
export class TransactionInteractor implements IInteractor {
  constructor(private readonly db: Database<LibraryDataset>) {}
  private repo = new TransactionRepository(this.db);
  private bookRepo = new BookRepository(this.db);
  private memberRepo = new MemberRepository(this.db);

  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await issueBook(this.repo, this.bookRepo, this.memberRepo);
          break;
        case '2':
          await returnBook(this.repo, this.bookRepo);
          break;
        case '3':
          await displayTransaction(this.repo);
          break;
        case '4':
          loop = false;
          break;
        default:
          console.log(chalk.redBright('\nInvalid Choice !!!\n'));
      }
    }
  }
}

async function getTransactionInput(
  bookRepo: BookRepository,
  memberRepo: MemberRepository
): Promise<ITransactionBase> {
  const memberId = await promptForValidInput(
    'Please enter your member Id: ',
    transactionBaseSchema.shape.memberId,
    undefined,
    memberRepo
  );
  const bookId = await promptForValidInput(
    'Please enter the Id of the book: ',
    transactionBaseSchema.shape.bookId,
    undefined,
    bookRepo
  );
  const today = new Date();
  const borrowDate = new Date(today);
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    memberId: memberId,
    bookId: bookId,
    borrowDate: formatDate(borrowDate),
    dueDate: formatDate(dueDate),
  };
}

async function getReturnBookInputs(
  repo: TransactionRepository
): Promise<RTransaction> {
  while (true) {
    const transactionId = await promptForValidInput(
      'Enter your transaction Id: ',
      returnSchema.shape.transactionId,
      0
    );
    const checkForTransaction = await repo.getById(transactionId);
    if (!checkForTransaction) {
      console.log('Transaction Id does not exist');
      continue;
    } else {
      const returnDate = new Date();
      return {
        transactionId: transactionId,
        returnDate: formatDate(returnDate),
      };
    }
  }
}

async function issueBook(
  repo: TransactionRepository,
  bookRepo: BookRepository,
  memberRepo: MemberRepository
) {
  const transaction = await getTransactionInput(bookRepo, memberRepo);
  const createdTransaction = await repo.issueBook(transaction);
  console.table(createdTransaction);
}

async function returnBook(
  repo: TransactionRepository,
  bookRepo: BookRepository
) {
  const transaction = await getReturnBookInputs(repo);
  const returnedBookTransaction = await repo.returnBook(
    transaction.transactionId,
    transaction.returnDate
  );

  if (returnedBookTransaction) {
    bookRepo.returnBook(returnedBookTransaction.bookId);
    const book = await bookRepo.getById(returnedBookTransaction.bookId);
    console.log(
      `Book [${book?.title}] successfully returned!! on ${returnedBookTransaction.returnDate}`
    );
  } else {
    console.log(
      'Book of this particular transaction Id has already been returned'
    );
  }
}

async function displayTransaction(repo: TransactionRepository) {
  const transactionId = await promptForValidInput(
    'Enter the transaction Id to display: ',
    z.number(),
    0
  );
  const transaction = await repo.getById(transactionId);
  if (transaction) {
    console.log('Transaction Details:\n');
    console.table(transaction);
    if (transaction.returnDate) {
      console.log(`The Book was returned on: ${transaction.returnDate}`);
    } else {
      console.log('The book has not been returned yet.');
    }
  } else {
    console.log('No transaction found with the given ID.');
  }
}
