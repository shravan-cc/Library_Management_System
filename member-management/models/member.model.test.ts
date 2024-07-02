import { z } from 'zod';
import { memberBaseSchema, memberSchema } from './member.model';

const validMemberBaseData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: 1234567890,
  membershipDate: new Date('2023-01-01'),
  booksIssued: ['Book1', 'Book2'],
};

const invalidMemberBaseData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890', // Invalid phone type
  membershipDate: '2023-01-01', // Invalid date type
  booksIssued: ['Book1', 'Book2'],
};

const validMemberData = {
  ...validMemberBaseData,
  memberId: 1,
};

const invalidMemberData = {
  ...validMemberBaseData,
  memberId: 'one', // Invalid memberId type
};

describe('memberBaseSchema', () => {
  test('should validate valid member base data', () => {
    expect(() => memberBaseSchema.parse(validMemberBaseData)).not.toThrow();
  });

  test('should invalidate invalid member base data', () => {
    expect(() => memberBaseSchema.parse(invalidMemberBaseData)).toThrow(
      z.ZodError
    );
  });
});

describe('memberSchema', () => {
  test('should validate valid member data', () => {
    expect(() => memberSchema.parse(validMemberData)).not.toThrow();
  });

  test('should invalidate invalid member data', () => {
    expect(() => memberSchema.parse(invalidMemberData)).toThrow(z.ZodError);
  });
});
