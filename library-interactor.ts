import { IInteractor } from './core/interactor';
import { BookInteractor } from './article-management/book.interactor';
import { Menu } from './core/menu';
import { MemberInteractor } from './member-management/member.interactor';
import chalk from 'chalk';
import { LibraryDataset } from './db/library-dataset';
import { TransactionInteractor } from './transaction-management/transaction.interactor';
import { AppEnvs } from './read-env';
import { MySQLAdapter } from './db/mysqldb';
import { MySQLDatabase } from './db/library-db';
import 'dotenv/config';
import { PoolConnectionFactory } from './db/mysql-transaction-connection';

const menu = new Menu([
  { key: '1', label: 'Book Management' },
  { key: '2', label: 'Member Management' },
  { key: '3', label: 'Transaction' },
  { key: '4', label: 'Exit' },
]);

export class LibraryInteractor implements IInteractor {
  private readonly factory = new PoolConnectionFactory({
    DbURL: AppEnvs.DATABASE_URL,
  });
  //private readonly db = new MySQLDatabase<LibraryDataset>(this.mySQLAdapter);
  // private readonly db = new Database<LibraryDataset>(
  //   // join(__dirname, './data/db.json')
  // );
  private readonly bookInteractor = new BookInteractor(this.factory);
  /*private readonly memberInteractor = new MemberInteractor(this.db);
  private readonly transactionInteractor = new TransactionInteractor(this.db);*/
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
        /*case '2':
          console.log(chalk.underline.blue.bold('\tMember Menu\n'));
          await this.memberInteractor.showMenu();
          break;
        case '3':
          console.log(chalk.underline.blue.bold('\tTransaction Menu\n'));
          await this.transactionInteractor.showMenu();
          break; */
        case '4':
          process.exit(0);
        default:
          console.log(chalk.redBright('\nInvalid choice!'));
      }
    }
  }
}
