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
  delete(
    id: number
  ): {
    firstName: string;
    lastName: string;
    phone: number;
    address: string;
    memberId: number;
  } | null {
    throw new Error('Method not implemented.');
  }
  getById(
    id: number
  ): {
    firstName: string;
    lastName: string;
    phone: number;
    address: string;
    memberId: number;
  } | null {
    throw new Error('Method not implemented.');
  }
  list(
    params: IPageRequest
  ): IPagedResponse<{
    firstName: string;
    lastName: string;
    phone: number;
    address: string;
    memberId: number;
  }> {
    throw new Error('Method not implemented.');
  }
}
