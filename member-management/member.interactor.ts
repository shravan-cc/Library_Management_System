import { IInteractor } from "../core/interactor";
import { MemberRepository } from "./member.repository";
import { readChar ,readLine} from "../core/input.utils";
import { Menu } from '../core/menu';
import { IMemberBase } from "./models/member.model";

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
          // TODO: add member flow
          break;
        case '3':
          //TODO : add member flow
          break;
        case '4':
          // TODO: add member flow
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
