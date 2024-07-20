import { IMember, IMemberBase } from './models/member.model';
import { IRepository } from '../core/repository';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { PageOption, WhereExpression } from '../libs/types';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const {
  generateCountSql,
  generateInsertSql,
  generateSelectSql,
  generateDeleteSql,
  generateUpdateSql,
} = MySqlQueryGenerator;

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private readonly factory: PoolConnectionFactory) {}

  async create(memberData: IMemberBase): Promise<IMember> {
    const dbConnection = await this.factory.acquirePoolConnection();
    try {
      const newMember: Omit<IMember, 'id'> = {
        ...memberData,
      };

      const { sql: insertSql, values: insertValues } =
        generateInsertSql<IMemberBase>('members', newMember);

      const queryResult = await dbConnection.query<ResultSetHeader>(
        insertSql,
        insertValues
      );

      const insertedMember = await this.getById(queryResult.insertId);

      if (!insertedMember) {
        throw new Error('Failed to retrieve the newly inserted member');
      }

      return insertedMember;
    } catch (error: any) {
      await dbConnection.release();
      throw new Error(`Insertion failed: ${error.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async update(
    memberId: number,
    memberData: IMemberBase
  ): Promise<IMember | null> {
    const dbConnection = await this.factory.acquireTransactionPoolConnection();
    try {
      const existingMember = await this.getById(memberId);
      if (!existingMember) {
        return null;
      }

      const updatedMember = {
        ...existingMember,
        ...memberData,
      };

      const { sql: updateSql, values: updateValues } =
        generateUpdateSql<IMember>('members', updatedMember, {
          id: { op: 'EQUALS', value: memberId },
        });

      await dbConnection.query<ResultSetHeader>(updateSql, updateValues);

      const editedMember = await this.getById(memberId);
      if (!editedMember) {
        await dbConnection.rollback();
        throw new Error('Failed to retrieve the newly edited member');
      }

      await dbConnection.commit();
      return editedMember;
    } catch (error: any) {
      await dbConnection.rollback();
      throw new Error(`Update failed: ${error.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async delete(id: number): Promise<IMember | null> {
    const dbConnection = await this.factory.acquireTransactionPoolConnection();
    try {
      const existingMember = await this.getById(id);
      if (!existingMember) {
        return null;
      }
      const { sql, values } = generateDeleteSql<IMember>('members', {
        id: { op: 'EQUALS', value: id },
      });
      await dbConnection.query<ResultSetHeader>(sql,values)
      await dbConnection.commit();
      return existingMember;
    } catch (e: any) {
      await dbConnection.rollback();
      throw new Error(`Deletion failed: ${e.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async getById(id: number): Promise<IMember | null> {
    const dbConnection = await this.factory.acquireTransactionPoolConnection();
    try {
      const { sql, values } = generateSelectSql<IMember>('members', [], {
        id: { op: 'EQUALS', value: id },
      });
      const [rows] = await dbConnection.query<RowDataPacket[]>(sql, values);
      await dbConnection.commit();
      return (rows as IMember) || null;
    } catch (e: any) {
      await dbConnection.rollback();
      throw new Error(`Selection failed: ${e.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async list(params: IPageRequest): Promise<IPagedResponse<IMember>> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
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

      const { sql, values } = generateSelectSql<IMember>(
        'members',
        [],
        where,
        pageOpts
      );
      const members = await connection.query(sql, values);

      const countSqlData = generateCountSql<IMember>('members', where);
      const totalMemberRows = await connection.query(
        countSqlData.sql,
        countSqlData.values
      );
      const totalMembers = (totalMemberRows as any)[0].COUNT;
      await connection.commit();
      return {
        items: members as IMember[],
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalMembers,
        },
      };
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Listing Members failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }
}
