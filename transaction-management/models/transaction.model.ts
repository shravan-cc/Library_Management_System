import { date, z } from 'zod';

const today = new Date();
const defaultDueDate = new Date(today);
defaultDueDate.setDate(today.getDate() + 7);

export const transactionBaseSchema = z.object({
  memberId: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
  bookId: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
  borrowDate: z.date().default(new Date()),
  dueDate: z.date().default(defaultDueDate),
});

export const transactionSchema = transactionBaseSchema.extend({
  transactionId: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
  returnDate: z.date().optional(),
});

export type ITransactionBase = z.infer<typeof transactionBaseSchema>;
export type ITransaction = z.infer<typeof transactionSchema>;
