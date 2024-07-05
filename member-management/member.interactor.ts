import { IInteractor } from '../core/interactor';
import { MemberRepository } from './member.repository';
import {  readLine } from '../core/input.utils';
import { Menu } from '../core/menu';
import { IMemberBase, memberBaseSchema } from './models/member.model';
import { z } from 'zod';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';

const searchSchema = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters long' })
  .regex(/^[a-zA-Z\s]+$/, {
    message: 'Name must contain only alphabetic characters',
  });

const menu = new Menu([
  { key: '1', label: 'Add Member' },
  { key: '2', label: 'Edit Member' },
  { key: '3', label: 'Search Member' },
  { key: '4', label: 'Delete Member' },
  { key: '5', label: 'Display Member' },
  { key: '6', label: '<Previous Menu>' },
]);
export class MemberInteractor implements IInteractor {
  constructor(private readonly db: Database<LibraryDataset>) {}
  private repo = new MemberRepository(this.db);
  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await addMember(this.repo);
          break;
        case '2':
          await editMember(this.repo);
          break;
        case '3':
          await searchMember(this.repo);
          break;
        case '4':
          await deleteMember(this.repo);
          break;
        case '5':
          await displayMembers(this.repo);
          break;
        case '6':
          loop = false;
          break;
        default:
          console.log('Invalid Choice!!');
      }
    }
  }
}

async function promptForValidInput<T>(
  question: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): Promise<T> {
  let input;
  do {
    input = await readLine(question);
    try {
      if (!input && defaultValue !== undefined) {
        return defaultValue;
      }
      return schema.parse(
        schema instanceof z.ZodNumber ? Number(input) : input
      );
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.log('Validation error:', e.errors[0].message);
      } else {
        console.log('An unknown error occurred:', e);
      }
    }
  } while (true);
}

async function getMemberInput(
  existingData?: IMemberBase
): Promise<IMemberBase> {
  const firstName = await promptForValidInput(
    `Please enter First Name${
      existingData?.firstName ? ` (${existingData.firstName})` : ''
    }: `,
    memberBaseSchema.shape.firstName,
    existingData?.firstName
  );
  const lastName = await promptForValidInput(
    `Please enter Last Name${
      existingData?.lastName ? ` (${existingData.lastName})` : ''
    }: `,
    memberBaseSchema.shape.lastName,
    existingData?.lastName
  );
  const phone = await promptForValidInput(
    `Please enter Phone Number${
      existingData?.phone ? ` (${existingData.phone})` : ''
    }: `,
    memberBaseSchema.shape.phone,
    existingData?.phone
  );

  const address = await promptForValidInput(
    `Please provide your address${
      existingData?.address ? ` (${existingData.address})` : ''
    }: `,
    memberBaseSchema.shape.address,
    existingData?.address
  );
  return {
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || 0,
    address: address || '',
  };
}
async function addMember(repo: MemberRepository) {
  const member: IMemberBase = await getMemberInput();
  const createdMember = await repo.create(member);
  console.log('Member Added successfully..\n');
  console.table(createdMember);
}
async function deleteMember(repo: MemberRepository) {
  const id = +(await readLine(
    '\nPlease enter the ID of the member you wish to delete: '
  ));
  const deletedMember = await repo.delete(id);
  if (deletedMember) {
    console.log('\nMember successfully deleted:\n', deletedMember);
  } else {
    console.log('\nNo member found with the given ID.');
  }
}

async function editMember(repo: MemberRepository) {
  const id = +(await readLine(
    '\nPlease enter the ID of the member you wish to edit : '
  ));
  const existingMember = await repo.getById(id);

  if (!existingMember) {
    console.log('\Member not found. Please check the ID and try again.');
    return;
  }

  console.log('\nExisting Member details:');
  console.table(existingMember);

  const updatedData = await getMemberInput(existingMember);
  const updatedMember = await repo.update(id, updatedData);

  if (updatedMember) {
    console.log('\nMember updated successfully..\n');
    console.table(updatedMember);
  } else {
    console.log('\nFailed to update Member. Please try again.');
  }
}

async function displayMembers(repo: MemberRepository) {
  const limit = +(await readLine(
    '\nEnter the maximum number of records you want to display: '
  ));
  let currentPage: number = 0;
  await loadData(repo, '', limit, currentPage);
  /*const members = (await repo.list({ limit: 100, offset: 0 })).items;
  if (members.length === 0) {
    console.log('Member not found');
  } else {
    console.table(members);
  }*/
}
async function searchMember(repo: MemberRepository) {
  const search = await promptForValidInput(
    '\nEnter the First Name/Last Name of the person whom you want to search: ',
    searchSchema,
    ''
  );
  const limit: number = 1;
  let currentPage: number = 0;
  await loadData(repo, search, limit, currentPage);
}

const loadData = async (
  repo: MemberRepository,
  search: string,
  limit: number,
  currentPage: number
) => {
  const members = await repo.list({
    search: search || undefined,
    limit: limit,
    offset: currentPage * limit,
  });
  if (members.items.length > 0) {
    const totalPages = Math.ceil(members.pagination.total / limit);
    console.log(`\nPage ${currentPage + 1} of ${totalPages}`);
    console.table(members.items);
    const hasPreviousPage: boolean = currentPage > 0;
    const hasNextPage: boolean =
      members.pagination.offset + members.pagination.limit <
      members.pagination.total;

    if (hasPreviousPage) {
      console.log('\nPress "p" for Previous Page');
    }
    if (hasNextPage) {
      console.log('Press "n" for Next Page');
    }
    if (hasPreviousPage || hasNextPage) {
      console.log('Press "q" to Quit\n');
      const askChoice = async () => {
        const op = (await readLine('\nChoice: ')).toUpperCase();
        console.log(op, '\n\n');
        if (op === 'P' && hasPreviousPage) {
          currentPage--;
          await loadData(repo, search, limit, currentPage);
        } else if (op === 'N' && hasNextPage) {
          currentPage++;
          await loadData(repo, search, limit, currentPage);
        } else if (op !== 'Q') {
          console.log('\nInvalid Choice:\n');
          await askChoice();
        }
      };
      await askChoice();
    }
  } else {
    console.log('\nNo data available to display at the moment.');
  }
};
