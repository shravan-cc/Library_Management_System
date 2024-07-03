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
    data: {
      firstName: string;
      lastName: string;
      phone: number;
      address: string;
    }
  ): {
    firstName: string;
    lastName: string;
    phone: number;
    address: string;
    memberId: number;
  } | null {
    throw new Error('Method not implemented.');
  }
  delete(id: number): IMember | null {
    const index = members.findIndex((member) => member.memberId === id);
    if (index !== -1) {
      const deletedMember = members.splice(index, 1)[0];
      return deletedMember;
    }
    return null;
  }
  getById(id: number): {
    firstName: string;
    lastName: string;
    phone: number;
    address: string;
    memberId: number;
  } | null {
    throw new Error('Method not implemented.');
  }
  list(params: IPageRequest): IPagedResponse<IMember> {
    const search = params.search?.toLowerCase();
    const filteredMembers = search
      ? members.filter(
          (b) =>
            b.firstName.toLowerCase().includes(search) ||
            b.lastName.toLowerCase().includes(search)
        )
      : members;
    return {
      items: filteredMembers.slice(params.offset, params.offset + params.limit),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filteredMembers.length,
      },
    };
  }
}
