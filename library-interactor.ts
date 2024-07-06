import { IInteractor } from './core/interactor';
import { BookInteractor } from './article-management/book.interactor';
import { Menu } from './core/menu';
import { MemberInteractor } from './member-management/member.interactor';
import { Database } from './db/db';
import chalk from 'chalk';
import { LibraryDataset } from './db/library-dataset';
import { TransactionInteractor } from './transaction-management/transaction.interactor';

const menu = new Menu([
  { key: '1', label: 'Book Management' },
  { key: '2', label: 'Member Management' },
  { key: '3', label: 'Transaction' },
  { key: '4', label: "Today's due list" },
  { key: '5', label: 'Exit' },
]);

export class LibraryInteractor implements IInteractor {
  private readonly db = new Database<LibraryDataset>('./data/db.json');
  private readonly bookInteractor = new BookInteractor(this.db);
  private readonly memberInteractor = new MemberInteractor(this.db);
  private readonly transactionInteractor = new TransactionInteractor(this.db);
  async showMenu(): Promise<void> {
    console.log(
      '+---------------------------------------------------------------+'
    );
    console.log(
      '|                   ' +
        chalk.blue.bold(' Library Management System') +
        '              \t|'
    );
    console.log(
      '+---------------------------------------------------------------+'
    );
    while (true) {
      console.log(chalk.underline.blue.bold('\n\tMain Menu\n'));
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          console.log(chalk.underline.blue.bold('\tBook Menu\n'));
          await this.bookInteractor.showMenu();
          break;
        case '2':
          console.log(chalk.underline.blue.bold('\tMember Menu\n'));
          await this.memberInteractor.showMenu();
          break;
        case '3':
          console.log(chalk.underline.blue.bold('\tTransaction Menu\n'));
          await this.transactionInteractor.showMenu();
          break;
        case '5':
          process.exit(0);
        default:
          console.log(chalk.redBright('\nInvalid choice!'));
      }
    }
  }
}
