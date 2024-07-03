import { IInteractor } from '../core/interactor';
import { MemberRepository } from './member.repository';
import { readChar, readLine } from '../core/input.utils';
import { Menu } from '../core/menu';
import { IMemberBase } from './models/member.model';
import { z } from 'zod';

export const firstNameSchema = z
  .string()
  .min(1, 'First Name is required')
  .regex(/^[a-zA-Z]+$/, 'First Name must be alphabetic');
export const lastNameSchema = z
  .string()
  .min(1, 'Last Name is required')
  .regex(/^[a-zA-Z]+$/, 'Last Name must be alphabetic');
export const phoneSchema = z
  .string()
  .min(10, 'Phone Number must be at least 10 digits')
  .regex(/^\d+$/, 'Phone Number must be numeric');
export const addressSchema = z.string().min(5, 'Address is required');

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
      const op = await readChar(menu.serialize());
      const menuItem = menu.getItem(op);
      if (menuItem) {
        console.log(`Choice: ${menuItem.key}.\t${menuItem.label}`);
      }
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

async function promptAndValidate<T>(question: string, schema: z.ZodSchema<T>) {
  let input;
  do {
    input = await readLine(question);
    try {
      return schema.parse(input);
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
  const firstName = await promptAndValidate(
    `Please enter First Name${
      existingData?.firstName ? ` (${existingData.firstName})` : ''
    }: `,
    firstNameSchema
  );
  const lastName = await promptAndValidate(
    `Please enter Last Name${
      existingData?.lastName ? ` (${existingData.lastName})` : ''
    }: `,
    lastNameSchema
  );
  const phone = await promptAndValidate(
    `Please enter Phone Number${
      existingData?.phone ? ` (${existingData.phone})` : ''
    }: `,
    phoneSchema
  );

  const address = await promptAndValidate(
    `Please provide your address${
      existingData?.address ? ` (${existingData.address})` : ''
    }: `,
    addressSchema
  );
  return {
    firstName: firstName || existingData?.firstName || '',
    lastName: lastName || existingData?.lastName || '',
    phone: +phone || existingData?.phone || 0,
    address: address || existingData?.address || '',
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
