import { z } from 'zod';

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
  firstName: z.string(),
  lastName: z.string(),
  phone: z.number(),

  address: z.string(),

});

export const memberSchema = memberBaseSchema.extend({
  memberId: z.number(),
});

export type IMemberBase = z.infer<typeof memberBaseSchema>;

export type IMember = z.infer<typeof memberSchema>;
