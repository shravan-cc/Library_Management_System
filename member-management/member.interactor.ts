import { IInteractor } from "../core/interactor";
import { MemberRepository } from "./member.repository";
import { readChar } from "../core/input.utils";

const menu = `
    1. Add Member
    2. Edit Member
    3. Search Member
    4. <Previous Menu>
    `;

export class MemberInteractor implements IInteractor {
  private repo = new MemberRepository();
  async showMenu(): Promise<void> {
    const op = await readChar(menu);
    switch (op.toLowerCase()) {
      case '1':
       // TODO: add member flow
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