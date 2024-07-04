import { z } from 'zod';
import { MemberInteractor } from '../member.interactor';

// interface IMemberBase {
//   firstName: 'string';
//   lastName: 'string';
//   phone: number;
//   membershipDate: Date;
//   booksIssued: string[];
// }

// interface IMember extends IMemberBase {
//   memberId: number;
// }

export const memberBaseSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters long' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'First name must contain only alphabetic characters',
    }),
  lastName: z.string().min(1, { message: 'Last name must be at least 1 characters long' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Last must contain only alphabetic characters',
    }),
  phone: z.number().min(10, 'Phone Number must be at least 10 digits').int(),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
});

export const memberSchema = memberBaseSchema.extend({
  memberId: z.number().int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
});

export type IMemberBase = z.infer<typeof memberBaseSchema>;
export type IMember = z.infer<typeof memberSchema>;
