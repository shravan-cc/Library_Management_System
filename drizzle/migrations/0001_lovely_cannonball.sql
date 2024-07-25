CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`author` varchar(150) NOT NULL,
	`publisher` varchar(50),
	`genre` varchar(31) NOT NULL,
	`isbnNo` varchar(31) NOT NULL,
	`pages` int NOT NULL,
	`totalCopies` int NOT NULL,
	`availableCopies` int NOT NULL,
	CONSTRAINT `books_id` PRIMARY KEY(`id`),
	CONSTRAINT `books_isbnNo_unique` UNIQUE(`isbnNo`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`phone` bigint NOT NULL,
	`address` varchar(100) NOT NULL,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`memberId` int NOT NULL,
	`borrowDate` varchar(10) NOT NULL,
	`dueDate` varchar(15) NOT NULL,
	`status` varchar(15) NOT NULL,
	`returnDate` varchar(10),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
