import { readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { BookRepository } from './book.repository';
import { IBookBase, bookBaseSchema } from './models/book.model';
import { Menu } from '../core/menu';
import { z } from 'zod';

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
          break;
        case '2':
          await editBook(this.repo);
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

async function promptForValidInput<T>(
  question: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): Promise<T> {
  let input;
  do {
    input = await readLine(question);
    if (!input && defaultValue != 'undefined') {
      return defaultValue;
    }
    try {
      return schema.parse(
        schema instanceof z.ZodNumber ? Number(input) : input
      );
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.log('Validation error:', e.errors[0].message);
      } else {
        console.log('An unknown error occurred:', e);
      }
    }
  } while (true);
}

async function getBookInput(existingData?: IBookBase): Promise<IBookBase> {
  const title = await promptForValidInput(
    `Please enter title${
      existingData?.title ? ` (${existingData.title})` : ''
    }: `,
    bookBaseSchema.shape.title,
    existingData?.title ?? ''
  );
  const author = await promptForValidInput(
    `Please enter author${
      existingData?.author ? ` (${existingData.author})` : ''
    }: `,
    bookBaseSchema.shape.author,
    existingData?.author ?? ''
  );
  const publisher = await promptForValidInput(
    `Please enter publisher${
      existingData?.publisher ? ` (${existingData.publisher})` : ''
    }: `,
    bookBaseSchema.shape.publisher,
    existingData?.publisher ?? ''
  );
  const genre = await promptForValidInput(
    `Please enter genre${
      existingData?.genre ? ` (${existingData.genre})` : ''
    }: `,
    bookBaseSchema.shape.genre,
    existingData?.genre ?? ''
  );
  const isbnNo = await promptForValidInput(
    `Please enter ISBN Number${
      existingData?.isbnNo ? ` (${existingData.isbnNo})` : ''
    }: `,
    bookBaseSchema.shape.isbnNo,
    existingData?.isbnNo ?? ''
  );
  const numOfPages = await promptForValidInput(
    `Please enter total num of pages${
      existingData?.numOfPages ? ` (${existingData.numOfPages})` : ''
    }: `,
    bookBaseSchema.shape.numOfPages,
    existingData?.numOfPages ?? 0
  );
  const totalNumOfCopies = await promptForValidInput(
    `Please enter the total num of copies${
      existingData?.totalNumOfCopies
        ? ` (${existingData.totalNumOfCopies})`
        : ''
    }: `,
    bookBaseSchema.shape.totalNumOfCopies,
    existingData?.totalNumOfCopies ?? 0
  );

  return {
    title: title,
    author: author,
    publisher: publisher,
    genre: genre,
    isbnNo: isbnNo,
    numOfPages: numOfPages,
    totalNumOfCopies: totalNumOfCopies,
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
