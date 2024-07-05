import { IBook } from '../article-management/models/book.model';
import { IMember } from '../member-management/models/member.model';

export interface LibraryDataset {
  books: IBook[];
  members: IMember[];
}
