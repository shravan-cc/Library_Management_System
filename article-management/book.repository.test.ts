import { join } from 'path';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { BookRepository } from './book.repository';
import { IBookBase } from './models/book.model';

describe('BookRepository Tests', () => {
  let books: IBookBase[];
  let bookRepository: BookRepository;
  let db: Database<LibraryDataset>;

  beforeAll(async () => {
    db = new Database(join(__dirname, './data/dbtest.json'));
    await db.clear();
  });
  beforeEach(() => {
    books = [
      {
        title: 'The Mysterious Island',
        author: 'Jules Verne',
        publisher: 'Penguin Classics',
        genre: 'Adventure',
        isbnNo: '9780140446029',
        numOfPages: 320,
        totalNumOfCopies: 15,
      },
      {
        title: '1984',
        author: 'George Orwell',
        publisher: 'Houghton Mifflin Harcourt',
        genre: 'Dystopian',
        isbnNo: '9780451524935',
        numOfPages: 328,
        totalNumOfCopies: 30,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        publisher: 'J.B. Lippincott & Co.',
        genre: 'Southern Gothic',
        isbnNo: '9780061120084',
        numOfPages: 281,
        totalNumOfCopies: 25,
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        publisher: 'Modern Library',
        genre: 'Romance',
        isbnNo: '9780679783268',
        numOfPages: 279,
        totalNumOfCopies: 40,
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publisher: 'Scribner',
        genre: 'Tragedy',
        isbnNo: '9780743273565',
        numOfPages: 180,
        totalNumOfCopies: 50,
      },
    ];
    bookRepository = new BookRepository(db);
  });

  test('should create a book', async () => {
    const data: IBookBase = books[0];
    const createdBook = await bookRepository.create(data);
    expect(createdBook).toBeDefined();
    expect(createdBook).toEqual({
      ...data,
      id: 1,
      availableNumOfCopies: data.totalNumOfCopies,
    });
  });

  test('should update a book', async () => {
    const data: IBookBase = books[0];
    const createdBook = await bookRepository.create(data);
    const updatedData: IBookBase = {
      ...data,
      title: 'The Mysterious Island - Updated',
      numOfPages: 350,
    };

    const updatedBook = await bookRepository.update(
      createdBook.id,
      updatedData
    );

    expect(updatedBook).toBeDefined();
    expect(updatedBook).toEqual({
      ...updatedData,
      id: createdBook.id,
      availableNumOfCopies: updatedData.totalNumOfCopies,
    });
  });

  test('should delete a book', async () => {
    const createdBook = await bookRepository.create(books[4]);
    const deletedBook = await bookRepository.delete(createdBook.id);
    expect(deletedBook).toBeDefined();
    expect(deletedBook).toEqual(createdBook);
    const fetchedBook = await bookRepository.getById(createdBook.id);
    expect(fetchedBook).toBeNull();
  });

  test('should get a book by id', async () => {
    const createdBook = await bookRepository.create(books[0]);
    const fetchedBook = await bookRepository.getById(createdBook.id);
    expect(fetchedBook).toBeDefined();
    expect(fetchedBook).toEqual(createdBook);
  });
});
