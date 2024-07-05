import { z } from 'zod'
export const transactionBaseSchema = z.object({
    memberId: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
    bookId:z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
    borrowDate :z.string().regex(/^\d{2}-\d{2}-\d{4}$/, { message: 'YYYY-MM-DD' })
})

export const transactionSchema = transactionBaseSchema.extend({
  transactionId: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
  returnDate: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, { message: 'YYYY-MM-DD' }),
});