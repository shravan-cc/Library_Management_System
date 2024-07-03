import { readChar, readLine } from './core/input.utils';
import { IInteractor } from './core/interactor';
import { BookRepository } from './article-management/book.repository';
import { BookInteractor } from './article-management/book.interactor';
import { Menu } from './core/menu';
import { MemberInteractor } from './member-management/member.interactor';

const menu = new Menu([
  { key: '1', label: 'Book Management' },
  { key: '2', label: 'Member Management' },
  { key: '3', label: 'Transaction' },
  { key: '4', label: "Today's due list" },
  { key: '5', label: 'Exit' },
]);

export class LibraryInteractor implements IInteractor {
  private readonly bookInteractor = new BookInteractor();
  private readonly memberInteractor = new MemberInteractor();
  async showMenu(): Promise<void> {
    while (true) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await this.bookInteractor.showMenu();
          break;
        case '2':
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
