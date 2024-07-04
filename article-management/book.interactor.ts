import { readChar, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { BookRepository } from './book.repository';
import { IBookBase, bookBaseSchema } from './models/book.model';
import { Menu } from '../core/menu';
import { z } from 'zod';
import { Database } from '../db/db';

const menu = new Menu([
  { key: '1', label: 'Add Book' },
  { key: '2', label: 'Edit Book' },
  { key: '3', label: 'Search Book' },
  { key: '4', label: 'Delete Book' },
  { key: '5', label: 'Display Book' },
  { key: '6', label: '<Previous Menu>' },
]);

export class BookInteractor implements IInteractor {
  constructor(private readonly db: Database) {}
  private repo = new BookRepository(this.db);
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
          await displayBooks(this.repo);
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
    try {
      if (!input && defaultValue !== undefined) {
        return defaultValue;
      }
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
    existingData?.title 
  );
  const author = await promptForValidInput(
    `Please enter author${
      existingData?.author ? ` (${existingData.author})` : ''
    }: `,
    bookBaseSchema.shape.author,
    existingData?.author 
  );
  const publisher = await promptForValidInput(
    `Please enter publisher${
      existingData?.publisher ? ` (${existingData.publisher})` : ''
    }: `,
    bookBaseSchema.shape.publisher,
    existingData?.publisher
  );
  const genre = await promptForValidInput(
    `Please enter genre${
      existingData?.genre ? ` (${existingData.genre})` : ''
    }: `,
    bookBaseSchema.shape.genre,
    existingData?.genre
  );
  const isbnNo = await promptForValidInput(
    `Please enter ISBN Number${
      existingData?.isbnNo ? ` (${existingData.isbnNo})` : ''
    }: `,
    bookBaseSchema.shape.isbnNo,
    existingData?.isbnNo
  );
  const numOfPages = await promptForValidInput(
    `Please enter total num of pages${
      existingData?.numOfPages ? ` (${existingData.numOfPages})` : ''
    }: `,
    bookBaseSchema.shape.numOfPages,
    existingData?.numOfPages
  );
  const totalNumOfCopies = await promptForValidInput(
    `Please enter the total num of copies${
      existingData?.totalNumOfCopies
        ? ` (${existingData.totalNumOfCopies})`
        : ''
    }: `,
    bookBaseSchema.shape.totalNumOfCopies,
    existingData?.totalNumOfCopies
  );

  return {
    title: title || '',
    author: author || '',
    publisher: publisher || '',
    genre: genre || '',
    isbnNo: isbnNo || '',
    numOfPages: numOfPages || 0,
    totalNumOfCopies: totalNumOfCopies || 0,
  };
}

async function addBook(repo: BookRepository) {
  const book: IBookBase = await getBookInput();
  const createdBook = await repo.create(book);
  console.log('Book added successfully!\n');
  console.table(createdBook);
}

async function editBook(repo: BookRepository) {
  const id = +(await readLine('Enter the ID of the book to edit: '));
  const existingBook = await repo.getById(id);

  if (!existingBook) {
    console.log('Book not found!');
    return;
  }

  console.log('Existing book details:');
  console.table(existingBook);

  const updatedData = await getBookInput(existingBook);
  const updatedBook = await repo.update(id, updatedData);

  if (updatedBook) {
    console.log('Book updated successfully!\n');
    console.table(updatedBook);
  } else {
    console.log('Failed to update book. Please try again.');
  }
}

async function deleteBook(repo: BookRepository) {
  const id = +(await readLine('Enter the ID of the book to delete: '));
  const deletedBook = await repo.delete(id);
  if (deletedBook) {
    console.log('Deleted Book:', deletedBook);
  } else {
    console.log('No books with given id');
  }
}

async function displayBooks(repo: BookRepository) {
  const books = (await repo.list({ limit: 100, offset: 0 })).items;
  if (books.length === 0) {
    console.log('Book not found');
  } else {
    console.table(books);
  }
}

async function searchBook(repo: BookRepository) {
  const search = await readLine(
    'Enter the Title/isbnNO of the book which you want to search: ' || ''
  );
  const pageSize = 1;
  let currentPage = 0;
  const loadPage = async () => {
    const result = repo.list({
      search: search || undefined,
      offset: currentPage * pageSize,
      limit: pageSize,
    });
    if (result.items.length > 0) {
      const totalPages = Math.ceil(result.pagination.total / pageSize);
      console.log(`\nPage ${currentPage + 1} of ${totalPages}`);
      console.table(result.items);
      const hasPreviousPage = currentPage > 0;
      
      const hasNextPage =
        result.pagination.offset + result.pagination.limit <
        result.pagination.total;
      if (hasNextPage) {
        console.log('\nn\tnext page');
      }
      if (hasPreviousPage) {
        console.log('\np previous page');
      }
      if (hasPreviousPage && hasNextPage) {
        console.log('\nq exit');
        const askChoice = async () => {
          const op = (await readChar('\nChoice :')).toLowerCase();
          console.log(op, '\n\n');
          if (op === 'n' && hasNextPage) {
            currentPage++;
            await loadPage();
          } else if (op === 'p' && hasPreviousPage) { 
            currentPage--;
            await loadPage();
          }
          else if (op !== 'q') {
            console.log('invalid choice..!!');
            await askChoice();
          }
        };
        await askChoice();
      }
    } else {
      console.log('not found');
    }
  };
  await loadPage();
}
