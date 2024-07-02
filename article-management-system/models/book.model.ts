export interface IBookBase {
  title: string;
  author: string;
  publisher: string;
  genre: string[];
  isbnNo: string;
  numOfPages: number;
  totalNoOfCopies: number;
}
export interface IBook extends IBookBase {
  id: number;
  availableNumOfCopies: number;
}
