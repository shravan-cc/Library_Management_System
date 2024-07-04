import { readChar, readLine } from './core/input.utils';
import { IInteractor } from './core/interactor';
import { BookRepository } from './article-management/book.repository';
import { BookInteractor } from './article-management/book.interactor';
import { Menu } from './core/menu';
import { MemberInteractor } from './member-management/member.interactor';
import { Database } from './db/db';

const menu = new Menu([
  { key: '1', label: 'Book Management' },
  { key: '2', label: 'Member Management' },
  { key: '3', label: 'Transaction' },
  { key: '4', label: "Today's due list" },
  { key: '5', label: 'Exit' },
]);

export class LibraryInteractor implements IInteractor {
  private readonly db = new Database('./data/db.json');
  private readonly bookInteractor = new BookInteractor(this.db);
  private readonly memberInteractor = new MemberInteractor(this.db);
  async showMenu(): Promise<void> {
    console.log(
      '\n|---------------------------------------------------------------------------|'
    );
    console.log('*\t\t\twelcome to library management\t\t\t    *');
    console.log(
      '|---------------------------------------------------------------------------|'
    );
    while (true) {
      console.log('\n\t\tMain Menu');
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          console.log('\t\tBook Menu\n');
          await this.bookInteractor.showMenu();
          break;
        case '2':
          console.log('\t\tMember Menu\n');
          await this.memberInteractor.showMenu();
          break;
        case '5':
          process.exit(0);
        default:
          console.log('Invalid choice!');
      }
    }
  }
}
