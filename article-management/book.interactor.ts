import { readChar, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { BookRepository } from './book.repository';
import { IBookBase } from './models/book.model';
const menu = `
    1. Add Book
    2. Edit Book
    3. Search Book
    4. <Previous Menu>
    `;
export class BookInteractor implements IInteractor {
  private repo = new BookRepository();
  async showMenu(): Promise<void> {
    const op = await readChar(menu);
    switch (op.toLowerCase()) {
      case '1':
        addBook(this.repo);
        break;
      case '2':
        // TODO: add book flow
        break;
      case '3':
        console.table(this.repo.list({ limit: 1000, offset: 0 }).items);
        break;
      case '4':
        // TODO: add book flow
        break;
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
  console.log('book added successfully!\n');
  console.table(createdBook);
}
