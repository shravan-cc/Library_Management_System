import { IMember, IMemberBase } from './models/member.model';
import { IRepository } from '../core/repository';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';

const members: IMember[] = [];

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  create(data: IMemberBase): IMember {
    const member: IMember = {
      ...data,
      memberId: members.length + 1,
    };
    members.push(member);
    return member;
  }
  update(
    id: number,
    data: IMemberBase
  ): IMember | null {
      const index = members.findIndex((m) => m.memberId === id);
      if (index === -1) {
          return null;
      }
      const updatedMember: IMember = {
          memberId: members[index].memberId,
          ...data,
      }
      members[index] = updatedMember;
      return updatedMember;
  }
  delete(id: number): IMember | null {
    const index = members.findIndex((member) => member.memberId === id);
    if (index !== -1) {
      const deletedMember = members.splice(index, 1)[0];
      return deletedMember;
    }
    return null;
  }
  getById(id: number):IMember |null {
    const member = members.find((m) => m.memberId === id)
    return member || null;
  }
  list(params: IPageRequest): IPagedResponse<{
    firstName: string;
    lastName: string;
    phone: number;
    address: string;
    memberId: number;
  }> {
    throw new Error('Method not implemented.');
  }
}
