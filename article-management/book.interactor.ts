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
  { key: '5', label: 'Display Book' },
  { key: '6', label: '<Previous Menu>' },
]);

export class BookInteractor implements IInteractor {
  private repo = new BookRepository();
  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await addBook(this.repo);
          console.table(this.repo.list({ limit: 100, offset: 0 }).items);
          break;
        case '2':
          await editBook(this.repo);
          console.table(this.repo.list({ limit: 100, offset: 0 }).items);
          break;
        case '3':
          await searchBook(this.repo);
          break;
        case '4':
          await deleteBook(this.repo);
          break;
        case '5':
          displayBooks(this.repo);
          break;
        case '6':
          loop = false;
          break;
        default:
          console.log('Invalid Choice!!');
      }
    }
  }
}

async function getBookInput(existingData?: IBookBase): Promise<IBookBase> {
  const title = await readLine(
    `Please enter title${
      existingData?.title ? ` (${existingData.title})` : ''
    }: `
  );
  const author = await readLine(
    `Please enter author${
      existingData?.author ? ` (${existingData.author})` : ''
    }: `
  );
  const publisher = await readLine(
    `Please enter publisher${
      existingData?.publisher ? ` (${existingData.publisher})` : ''
    }: `
  );
  const genre = await readLine(
    `Please enter genre${
      existingData?.genre ? ` (${existingData.genre})` : ''
    }: `
  );
  const isbnNo = await readLine(
    `Please enter ISBN Number${
      existingData?.isbnNo ? ` (${existingData.isbnNo})` : ''
    }: `
  );
  const numOfPages = await readLine(
    `Please enter total num of pages${
      existingData?.numOfPages ? ` (${existingData.numOfPages})` : ''
    }: `
  );
  const totalNumOfCopies = await readLine(
    `Please enter the total num of copies${
      existingData?.totalNumOfCopies
        ? ` (${existingData.totalNumOfCopies})`
        : ''
    }: `
  );

  return {
    title: title || existingData?.title || '',
    author: author || existingData?.author || '',
    publisher: publisher || existingData?.publisher || '',
    genre: genre || existingData?.genre || '',
    isbnNo: isbnNo || existingData?.isbnNo || '',
    numOfPages: +numOfPages || existingData?.numOfPages || 0,
    totalNumOfCopies: +totalNumOfCopies || existingData?.totalNumOfCopies || 0,
  };
}

async function addBook(repo: BookRepository) {
  const book: IBookBase = await getBookInput();
  const createdBook = repo.create(book);
  console.log('Book added successfully!\n');
  console.table(createdBook);
}

async function editBook(repo: BookRepository) {
  const id = +(await readLine('Enter the ID of the book to edit: '));
  const existingBook = repo.getById(id);

  if (!existingBook) {
    console.log('Book not found!');
    return;
  }

  console.log('Existing book details:');
  console.table(existingBook);

  const updatedData = await getBookInput(existingBook);
  const updatedBook = repo.update(id, updatedData);

  if (updatedBook) {
    console.log('Book updated successfully!\n');
    console.table(updatedBook);
  } else {
    console.log('Failed to update book. Please try again.');
  }
}

async function deleteBook(repo: BookRepository) {
  const id = +(await readLine('Enter the ID of the book to delete: '));
  const deletedBook = repo.delete(id);
  if (deletedBook) {
    console.log('Deleted Book:', deletedBook);
  } else {
    console.log('No books with given id');
  }
}

function displayBooks(repo: BookRepository) {
  const books = repo.list({ limit: 100, offset: 0 }).items;
  if (books.length === 0) {
    console.log('Book not found');
  } else {
    console.table(books);
  }
}

async function searchBook(repo: BookRepository) {
  const search = await readLine(
    'Enter the Title/isbnNO of the book which you want to search: '
  );
  const books = repo.list({ search, limit: 100, offset: 0 }).items;
  if (books.length === 0) {
    console.log('Book not found');
  } else {
    console.table(books);
  }
}
