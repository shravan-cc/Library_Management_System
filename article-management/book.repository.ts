import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { IRepository } from '../core/repository';
import { IBook, IBookBase } from './models/book.model';

const books: IBook[] = [];

export class BookRepository implements IRepository<IBookBase, IBook> {
  create(data: IBookBase): IBook {
    const book: IBook = {
      ...data,
      id: books.length + 1,
      availableNumOfCopies: data.totalNumOfCopies,
    };
    books.push(book);
    return book;
  }

  update(id: number, data: IBookBase): IBook | null {
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) {
      return null; //
    }
    const updatedBook: IBook = {
      id: books[index].id,
      ...data,
      availableNumOfCopies: data.totalNumOfCopies,
    };
    books[index] = updatedBook;
    return updatedBook;
  }
  delete(id: number): IBook | null {
    throw new Error('Method not implemented');
  }
  getById(id: number): IBook | null {
    const book = books.find((b) => b.id === id);
    return book || null;
  }
  list(params: IPageRequest): IPagedResponse<IBook> {
    const search = params.search?.toLowerCase();
    const filteredBooks = search
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(search) ||
            b.isbnNo.toLowerCase().includes(search)
        )
      : books;
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
