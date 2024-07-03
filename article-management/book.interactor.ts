import { readChar, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { BookRepository } from './book.repository';
import { IBookBase } from './models/book.model';
import { Menu } from '../core/menu';
import { z } from 'zod';

export const titleSchema = z
  .string()
  .min(5, 'Title is required')
  .regex(/^[a-zA-Z]+$/, 'Title must be alphabetic');
export const authorSchema = z
  .string()
  .min(5, 'Author is required')
  .regex(/^[a-zA-Z]+$/, 'Author must be alphabetic');
export const publisherSchema = z
  .string()
  .min(5, 'Publisher is required')
  .regex(/^[a-zA-Z]+$/, 'Publisher must be alphabetic');
export const genreSchema = z
  .string()
  .min(3, 'Genre is required')
  .regex(/^[a-zA-Z]+$/, 'Genre must be alphabetic');
export const isbnNoSchema = z.string().min(5, 'ISBN Number is required');
export const numOfPagesSchema = z
  .number()
  .int()
  .positive('Number of pages must be a positive integer');
export const totalNumOfCopiesSchema = z
  .number()
  .int()
  .positive('Total number of copies must be a positive integer');

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

async function promptAndValidate<T>(
  question: string,
  schema: z.ZodSchema<T>,
  isNumeric = false
) {
  let input;
  do {
    input = await readLine(question);
    try {
      const value = isNumeric ? Number(input) : input;
      return schema.parse(value);
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
  const title = await promptAndValidate(
    `Please enter title${
      existingData?.title ? ` (${existingData.title})` : ''
    }: `,
    titleSchema
  );
  const author = await promptAndValidate(
    `Please enter author${
      existingData?.author ? ` (${existingData.author})` : ''
    }: `,
    authorSchema
  );
  const publisher = await promptAndValidate(
    `Please enter publisher${
      existingData?.publisher ? ` (${existingData.publisher})` : ''
    }: `,
    publisherSchema
  );
  const genre = await promptAndValidate(
    `Please enter genre${
      existingData?.genre ? ` (${existingData.genre})` : ''
    }: `,
    genreSchema
  );
  const isbnNo = await promptAndValidate(
    `Please enter ISBN Number${
      existingData?.isbnNo ? ` (${existingData.isbnNo})` : ''
    }: `,
    isbnNoSchema
  );
  const numOfPages = await promptAndValidate(
    `Please enter total num of pages${
      existingData?.numOfPages ? ` (${existingData.numOfPages})` : ''
    }: `,
    numOfPagesSchema,
    true
  );
  const totalNumOfCopies = await promptAndValidate(
    `Please enter the total num of copies${
      existingData?.totalNumOfCopies
        ? ` (${existingData.totalNumOfCopies})`
        : ''
    }: `,
    totalNumOfCopiesSchema,
    true
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
