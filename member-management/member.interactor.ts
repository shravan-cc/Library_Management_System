import { IInteractor } from '../core/interactor';
import { MemberRepository } from './member.repository';
import { readChar, readLine } from '../core/input.utils';
import { Menu } from '../core/menu';
import { IMemberBase, memberBaseSchema } from './models/member.model';
import { z } from 'zod';

const menu = new Menu([
  { key: '1', label: 'Add Member' },
  { key: '2', label: 'Edit Member' },
  { key: '3', label: 'Search Member' },
  { key: '4', label: 'Delete Member' },
  { key: '5', label: 'Display Member' },
  { key: '6', label: '<Previous Menu>' },
]);
export class MemberInteractor implements IInteractor {
  private repo = new MemberRepository();
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
          console.table(this.repo.list({ limit: 100, offset: 0 }).items);
          break;
        case '3':
          await searchMember(this.repo);
          break;
        case '4':
          await deleteMember(this.repo);
          break;
        case '5':
          displayMembers(this.repo);
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
    if (!input && defaultValue != 'undefined') {
      return defaultValue;
    }
    try {
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
    existingData?.firstName ?? ''
  );
  const lastName = await promptForValidInput(
    `Please enter Last Name${
      existingData?.lastName ? ` (${existingData.lastName})` : ''
    }: `,
    memberBaseSchema.shape.lastName,
    existingData?.lastName ?? ''
  );
  const phone = await promptForValidInput(
    `Please enter Phone Number${
      existingData?.phone ? ` (${existingData.phone})` : ''
    }: `,
    memberBaseSchema.shape.phone,
    existingData?.phone ?? 0
  );

  const address = await promptForValidInput(
    `Please provide your address${
      existingData?.address ? ` (${existingData.address})` : ''
    }: `,
    memberBaseSchema.shape.address,
    existingData?.address ?? ''
  );
  return {
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    address: address,
  };
}
async function addMember(repo: MemberRepository) {
  const member: IMemberBase = await getMemberInput();
  const createdMember = repo.create(member);
  console.log('Member Added successfully..\n');
  console.table(createdMember);
}
async function deleteMember(repo: MemberRepository) {
  const id = +(await readLine('Enter the ID of the book to delete: '));
  const deletedMember = repo.delete(id);
  if (deletedMember) {
    console.log('Deleted Member:', deletedMember);
  } else {
    console.log('No members with given id');
  }
}

async function editMember(repo: MemberRepository) {
  const id = +(await readLine('\nEnter the Id of the Member to edit :\n'));
  const existingMember = repo.getById(id);

  if (!existingMember) {
    console.log('Member not Found');
    return;
  }

  console.log('Existing book details:');
  console.table(existingMember);

  const updatedData = await getMemberInput(existingMember);
  const updatedMember = repo.update(id, updatedData);

  if (updatedMember) {
    console.log('Member updated successfully..\n');
    console.table(updatedMember);
  } else {
    console.log('Failed to update Member. Please try again.');
  }
}

function displayMembers(repo: MemberRepository) {
  const members = repo.list({ limit: 100, offset: 0 }).items;
  if (members.length === 0) {
    console.log('Member not found');
  } else {
    console.table(members);
  }
}
async function searchMember(repo: MemberRepository) {
  const search = await readLine(
    'Enter the First Name/Last Name of the person whom you want to search: '
  );
  const members = repo.list({ search, limit: 100, offset: 0 }).items;
  if (members.length === 0) {
    console.log('Member not found');
  } else {
    console.table(members);
  }
}
