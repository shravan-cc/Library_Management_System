import chalk from 'chalk';
import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { TransactionRepository } from './transaction.repository';

const menu = new Menu([
  { key: '1', label: 'Issue A Book' },
  { key: '2', label: 'Return A Book' },
  { key: '3', label: 'Display Transaction' },
  { key: '4', label: '<Previous Menu>' },
]);
export class TransactionInteractor implements IInteractor {
  constructor(private readonly db: Database<LibraryDataset>) {}
  private repo = new TransactionRepository(this.db);
  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await issueBook(this.repo);
          break;
        case '2':
          await returnBook(this.repo);
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

async function issueBook(repo: TransactionRepository) {}

async function returnBook(repo: TransactionRepository) {}

async function displayTransaction(repo: TransactionRepository) {}
