import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';

const menu = new Menu([
  { key: '1', label: 'Issue A Book' },
  { key: '2', label: 'Return A Book' },
  { key: '3', label: '<Previous Menu>' },
]);
export class TransactionInteractor implements IInteractor {
  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
          case '1':
              await issueBook();
          break;
          case '2':
              await returnBook();
          break;
        case '3':
          loop = false;
          break;
        default:
          console.log('Invalid Choice !!!');
      }
    }
  }
}

function issueBook() {
    //todo:add flow
    throw new Error('Function not implemented.');
}

function returnBook() {
    //todo:add flow
    throw new Error('Function not implemented.');
}

