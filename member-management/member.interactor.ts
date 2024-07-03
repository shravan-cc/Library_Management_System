import { IInteractor } from '../core/interactor';
import { MemberRepository } from './member.repository';
import { readChar, readLine } from '../core/input.utils';
import { Menu } from '../core/menu';
import { IMemberBase } from './models/member.model';

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
          //TODO : add member flow
          break;
        case '4':
          await deleteMember(this.repo);
          break;
      }
    }
  }
}

async function getMemberInput(
  existingData?: IMemberBase
): Promise<IMemberBase> {
  const firstName = await readLine(
    `Please enter First Name${
      existingData?.firstName ? ` (${existingData.firstName})` : ''
    }: `
  );
  const lastName = await readLine(
    `Please enter Last Name${
      existingData?.lastName ? ` (${existingData.lastName})` : ''
    }: `
  );
  const phone = await readLine(
    `Please enter Phone Number${
      existingData?.phone ? ` (${existingData.phone})` : ''
    }: `
  );

  const address = await readLine(
    `Please provide your address${
      existingData?.address ? ` (${existingData.address})` : ''
    }: `
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
