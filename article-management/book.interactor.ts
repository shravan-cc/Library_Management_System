import { I } from 'vitest/dist/reporters-yx5ZTtEV';
import { readChar, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { BookRepository } from './book.repository';
import { IBookBase } from './models/book.model';
import { Menu } from '../core/menu';

const menu = new Menu([
  { key: '1', label: 'Add Book' },
  { key: '2', label: 'Edit Book' },
  { key: '3', label: 'Search Book' },
  { key: '4', label: 'Delete Book' },
  { key: '4', label: '<Previous Menu>' },
]);

export class BookInteractor implements IInteractor {
  private repo = new BookRepository();
  async showMenu(): Promise<void> {
    while (true) {
      const op = await readChar(menu.serialize());
      const menuItem = menu.getItem(op);
      if (menuItem) {
        console.log(`Choice: ${menuItem.key}.\t${menuItem.label}`);
      }
      switch (op.toLowerCase()) {
        case '1':
          await addBook(this.repo);
          break;
        case '2':
          // TODO: edit book flow
          break;
        case '3':
          console.table(this.repo.list({ limit: 1000, offset: 0 }).items);
          break;
        case '4':
          // TODO: update book
          break;
        case '5':
          // TODO: previous menu
          break;
        default:
          console.log('Invalid Choice!!');
      }
    }
  }
}

async function getBookInput() {
  const title = await readLine('please enter title: ');
  const author = await readLine('Please enter author: ');
  const publisher = await readLine('Please enter publisher: ');
  const genre = await readLine('Please enter genre: ');
  const isbnNo = await readLine('Please enter ISBN Number: ');
  const numOfPages = await readLine('Please enter total num of pages: ');
  const totalNumOfCopies = await readLine(
    'Please enter the total num of copies: '
  );
  return {
    title: title,
    author: author,
    publisher: publisher,
    genre: genre,
    isbnNo: isbnNo,
    numOfPages: +numOfPages,
    totalNumOfCopies: +totalNumOfCopies,
  };
}

async function addBook(repo: BookRepository) {
  const book: IBookBase = await getBookInput();
  const createdBook = repo.create(book);
  console.log('Book added successfully!\n');
  console.table(createdBook);
}
