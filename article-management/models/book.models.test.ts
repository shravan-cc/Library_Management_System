import {test,expect} from 'vitest'
import {bookBaseSchema, bookSchema} from './book.model'

const validBookBaseData = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  publisher: 'Scribner',
  genre: 'Novel',
  isbnNo: '9780743273565',
  numOfPages: 180,
  totalNumOfCopies: 10,
};

const invalidBookBaseData = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  publisher: 'Scribner',
  genre: 'Novel',
  isbnNo: '9780743273565',
  numOfPages: -1, // Invalid number of pages
  totalNumOfCopies: 10,
};

const validBookData = {
  ...validBookBaseData,
  id: 1,
  availableNumOfCopies: 5,
};

const invalidBookData = {
  ...invalidBookBaseData,
  id: 'one', // Invalid id type
  availableNumOfCopies: -1, // Invalid availableNumOfCopies
};
test('should not throw an error for valid book data', () => {
  expect(() => bookBaseSchema.parse(validBookData)).not.toThrow();
});
test('should throw an error for invalid book data', () => {
  expect(() => bookSchema.parse(invalidBookData)).toThrow();
});