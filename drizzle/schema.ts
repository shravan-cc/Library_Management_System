import {
  bigint,
  int,
  mysqlTable,
  serial,
  varchar,
} from 'drizzle-orm/mysql-core';

export const UserTable = mysqlTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
});

export const BookTable = mysqlTable('books', {
  id: serial('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 100 }).notNull(),
  author: varchar('author', { length: 150 }).notNull(),
  publisher: varchar('publisher', { length: 50 }),
  genre: varchar('genre', { length: 31 }).notNull(),
  isbnNo: varchar('isbnNo', { length: 31 }).unique().notNull(),
  pages: int('pages').notNull(),
  totalCopies: int('totalCopies').notNull(),
  availableCopies: int('availableCopies').notNull(),
});

export const MemberTable = mysqlTable('members', {
  id: serial('id').primaryKey().autoincrement(),
  firstName: varchar('firstName', { length: 50 }).notNull(),
  lastName: varchar('lastName', { length: 50 }).notNull(),
  phone: bigint('phone', { mode: 'number' }).notNull(),
  address: varchar('address', { length: 100 }).notNull(),
});

export const TransactionTable = mysqlTable('transactions', {
  id: serial('id').primaryKey().autoincrement(),
  bookId: int('bookId').notNull(),
  memberId: int('memberId').notNull(),
  borrowDate: varchar('borrowDate', { length: 10 }).notNull(),
  dueDate: varchar('dueDate', { length: 15 }).notNull(),
  status: varchar('status', { length: 15 }).notNull(),
  returnDate: varchar('returnDate', { length: 10 }),
});
