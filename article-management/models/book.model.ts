import { z } from 'zod';

// export interface IBookBase {
//   title: string;
//   author: string;
//   publisher: string;
//   genre: string;
//   isbnNo: string;
//   numOfPages: number;
//   totalNumOfCopies: number;
// }

// export interface IBook extends IBookBase {
//   id: number;
//   availableNumOfCopies: number;
// }

export const bookBaseSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'Title must contain only alphabetic characters',
    }),
  author: z
    .string()
    .min(5, { message: 'Author is required' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'Author name must contain only alphabetic characters',
    }),
  publisher: z
    .string()
    .min(5, { message: 'Publisher is required' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'Publisher name must contain only alphabetic characters',
    }),
  genre: z
    .string()
    .min(3, { message: 'Genre is required' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'Genre must contain only alphabetic characters',
    }),
  isbnNo: z
    .string()
    .length(13, { message: 'ISBN Number must be exactly 13 characters long' }),
  numOfPages: z
    .number()
    .int({ message: 'Number of pages must be an integer' })
    .positive({ message: 'Number of pages must be a positive integer' }),
  totalNumOfCopies: z
    .number()
    .int({ message: 'Total number of copies must be an integer' })
    .positive({ message: 'Total number of copies must be a positive integer' }),
});

export const bookSchema = bookBaseSchema.extend({
  id: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
  availableNumOfCopies: z
    .number()
    .int({ message: 'Available number of copies must be an integer' })
    .nonnegative({
      message: 'Available number of copies must be a non-negative integer',
    }),
});

export type IBookBase = z.infer<typeof bookBaseSchema>;
export type IBook = z.infer<typeof bookSchema>;

export const bookBaseSchemaArray = z.array(bookBaseSchema);
export const bookSchemaArray = z.array(bookSchema);
