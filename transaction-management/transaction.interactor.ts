import chalk from 'chalk';
import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { TransactionRepository } from './transaction.repository';
import {
  ITransactionBase,
  transactionBaseSchema,
  RTransaction,
  returnSchema,
} from './models/transaction.model';
import { z } from 'zod';
import { ReadLine } from 'readline';
import { BookRepository } from '../article-management/book.repository';
import { MemberRepository } from '../member-management/member.repository';
import { promptForValidInput, readLine } from '../core/input.utils';

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

async function validateInput<T>(
  question: string,
  schema: z.ZodSchema<T>,
  defaultValue: T,
  memberRepo?: MemberRepository,
  bookRepo?: BookRepository
): Promise<T> {
  while (true) {
    try {
      const input = await readLine(question);

      if (memberRepo && !bookRepo) {
        const memberExists = await memberRepo.getById(Number(input));
        if (!memberExists && !isNaN(Number(input))) {
          console.log('There is no member with particular Id');
          continue;
        }
      }

      if (bookRepo) {
        const bookId = Number(input);
        const bookExists = await bookRepo.getById(bookId);
        if (!bookExists && !isNaN(Number(input))) {
          console.log('Book with particular Id does not exist');
          continue;
        }

        const bookAvailable = await bookRepo.handeBook(bookId);
        if (!bookAvailable) {
          console.log('There are no copies available for this book');
          continue;
        }
      }
      if (!input && defaultValue !== undefined) {
        return defaultValue;
      }

      return schema.parse(
        schema instanceof z.ZodNumber ? Number(input) : input
      );
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        console.log('Validation error:', e.errors[0].message);
      } else {
        console.log('An unknown error occurred:', e.message);
      }
    }
  }
}

async function getTransactionInput(
  bookRepo: BookRepository,
  memberRepo: MemberRepository
): Promise<ITransactionBase> {
  const memberId = await validateInput(
    'Please enter your member Id: ',
    transactionBaseSchema.shape.memberId,
    0,
    memberRepo
  );
  const bookId = await validateInput(
    'Please enter the Id of the book: ',
    transactionBaseSchema.shape.bookId,
    0,
    memberRepo,
    bookRepo
  );
  const today = new Date();
  const borrowDate = new Date(today);
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    memberId: memberId,
    bookId: bookId,
    borrowDate: borrowDate,
    dueDate: dueDate,
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
        returnDate: returnDate,
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
  console.log(createdTransaction);
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
    console.log(
      `Book successfully returned!! on ${returnedBookTransaction.returnDate}`
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
    console.log('Transaction Details:');
    console.log(`Transaction ID: ${transaction.transactionId}`);
    console.log(`Member ID: ${transaction.memberId}`);
    console.log(`Book ID: ${transaction.bookId}`);
    console.log(`Borrow Date: ${transaction.borrowDate}`);
    console.log(`Due Date: ${transaction.dueDate}`);
    if (transaction.returnDate) {
      console.log(`Return Date: ${transaction.returnDate}`);
    } else {
      console.log('The book has not been returned yet.');
    }
  } else {
    console.log('No transaction found with the given ID.');
  }
}
