import chalk from 'chalk';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { IRepository } from '../core/repository';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { IBook, IBookBase } from './models/book.model';

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private readonly db: Database<LibraryDataset>) {}
  private currentBookId = 0;
  private get books(): IBook[] {
    return this.db.table('books');
  }
  private generateBookId() {
    if (this.books.length >= 1) {
      this.currentBookId = Math.max(...this.books.map((book) => book.id));
      this.currentBookId += 1;
      return this.currentBookId;
    }
    this.currentBookId = 1;
    return this.currentBookId;
  }
  async create(data: IBookBase): Promise<IBook> {
    const bookId = this.generateBookId();
    const book: IBook = {
      ...data,
      id: bookId,
      availableCopies: data.totalCopies,
    };
    this.books.push(book);
    await this.db.save();
    return book;
  }

  async update(id: number, data: IBookBase): Promise<IBook | null> {
    const index = this.books.findIndex((b) => b.id === id);
    if (index === -1) {
      return null; //
    }
    const updatedBook: IBook = {
      id: this.books[index].id,
      ...data,
      availableCopies: data.totalCopies,
    };
    this.books[index] = updatedBook;
    await this.db.save();
    return updatedBook;
  }

  async delete(id: number): Promise<IBook | null> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index !== -1) {
      const deletedBook: IBook = this.books.splice(index, 1)[0];
      return deletedBook;
    }
    return null;
  }
  async getById(id: number): Promise<IBook | null> {
    const book = this.books.find((b) => b.id === id);
    return book || null;
  }

  async handleBook(id: number): Promise<boolean> {
    const index = this.books.findIndex((book) => book.id === id);

    if (this.books[index].availableCopies > 0) {
      console.log(chalk.greenBright('Book issued successfully.'));
      this.books[index].availableCopies -= 1;
      this.db.save();
      return true;
    }
    return false;
  }

  async returnBook(id: number): Promise<void> {
    const index = this.books.findIndex((book) => book.id === id);
    this.books[index].availableCopies += 1;
    this.db.save();
  }

  async list(params: IPageRequest): Promise<IPagedResponse<IBook>> {
    const search = params.search?.toLowerCase();
    const filteredBooks = search
      ? this.books.filter(
          (b) =>
            b.title.toLowerCase().includes(search) ||
            b.isbnNo.toLowerCase().includes(search)
        )
      : this.books;
    return {
      items: filteredBooks.slice(params.offset, params.offset + params.limit),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filteredBooks.length,
      },
    };
  }
}
