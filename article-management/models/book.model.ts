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
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  genre: z.string(),
  isbnNo: z.string(),
  numOfPages: z.number().int().positive(),
  totalNumOfCopies: z.number().int().positive(),
});


export const bookSchema = bookBaseSchema.extend({
  id: z.number().int().positive(),
  availableNumOfCopies: z.number().int().nonnegative(),
});

export type IBookBase = z.infer<typeof bookBaseSchema>;
export type IBook = z.infer<typeof bookSchema>

export const bookBaseSchemaArray = z.array(bookBaseSchema);
export const bookSchemaArray = z.array(bookSchema);