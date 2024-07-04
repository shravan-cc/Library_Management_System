import { IMember, IMemberBase } from './models/member.model';
import { IRepository } from '../core/repository';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { Database } from '../db/db';

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private readonly db: Database) {}
  private get members(): IMember[] {
    return this.db.table<IMember>('members');
  }
  async create(data: IMemberBase): Promise<IMember> {
    const member: IMember = {
      ...data,
      memberId: this.members.length + 1,
    };
    this.members.push(member);
    await this.db.save();
    return member;
  }
  async update(id: number, data: IMemberBase): Promise<IMember | null> {
    const index = this.members.findIndex((m) => m.memberId === id);
    if (index === -1) {
      return null;
    }
    const updatedMember: IMember = {
      memberId: this.members[index].memberId,
      ...data,
    };
    this.members[index] = updatedMember;
    await this.db.save();
    return updatedMember;
  }
  async delete(id: number): Promise<IMember | null> {
    const index = this.members.findIndex((member) => member.memberId === id);
    if (index !== -1) {
      const deletedMember = this.members.splice(index, 1)[0];
      await this.db.save();
      return deletedMember;
    }
    return null;
  }
  async getById(id: number): Promise<IMember | null> {
    const member = this.members.find((m) => m.memberId === id);
    return member || null;
  }
  async list(params: IPageRequest): Promise<IPagedResponse<IMember>> {
    const search = params.search?.toLowerCase();
    const filteredMembers = search
      ? this.members.filter(
          (b) =>
            b.firstName.toLowerCase().includes(search) ||
            b.lastName.toLowerCase().includes(search)
        )
      : this.members;
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
