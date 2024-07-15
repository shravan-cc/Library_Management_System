import { IMember, IMemberBase } from './models/member.model';
import { IRepository } from '../core/repository';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { LibraryDataset } from '../db/library-dataset';
import { MySQLDatabase } from '../db/library-db';
import { PageOption, WhereExpression } from '../libs/types';

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private readonly db: MySQLDatabase<LibraryDataset>) {}

  async create(data: IMemberBase): Promise<IMember> {
    const member: Omit<IMember, 'id'> = {
      ...data,
    };
    const result = await this.db.insert('members', member);
    const insertedMember = await this.getById(result.insertId);

    if (!insertedMember) {
      throw new Error('Failed to retrieve the newly inserted member');
    }
    return insertedMember;
  }

  async update(id: number, data: IMemberBase): Promise<IMember | null> {
    const existingMember = await this.getById(id);
    if (!existingMember) {
      return null;
    }
    const updatedMember = {
      ...existingMember,
      ...data,
    };
    const result = await this.db.update('members', updatedMember, {
      id: { op: 'EQUALS', value: id },
    });
    const editedMember = await this.getById(id);
    if (!editedMember) {
      throw new Error('Failed to retrieve the newly edited member');
    }
    return editedMember;
  }

  async delete(id: number): Promise<IMember | null> {
    const existingMember = await this.getById(id);
    if (!existingMember) {
      return null;
    }
    await this.db.delete('members', { id: { op: 'EQUALS', value: id } });
    return existingMember;
  }

  async getById(id: number): Promise<IMember | null> {
    const result = await this.db.select('members', [], {
      id: { op: 'EQUALS', value: id },
    });
    return result[0] || null;
  }

  async list(params: IPageRequest): Promise<IPagedResponse<IMember>> {
    const search = params.search?.toLowerCase();
    let where: WhereExpression<IMember> = {};

    if (search) {
      where = {
        OR: [
          {
            firstName: { op: 'CONTAINS', value: search },
          },
          {
            lastName: { op: 'CONTAINS', value: search },
          },
        ],
      };
    }

    const pageOpts: PageOption = {
      offset: params.offset,
      limit: params.limit,
    };

    try {
      const books = await this.db.select('members', [], where, pageOpts);
      const totalBooks = await this.db.count('members', where);

      return {
        items: books || [],
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalBooks as number,
        },
      };
    } catch (error) {
      throw new Error('Failed to list members');
    }
  }
}
