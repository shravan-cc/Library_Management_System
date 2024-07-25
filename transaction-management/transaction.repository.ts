import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IPagedResponse, IPageRequest } from '../core/pagination.response';
import { ITransactionRepository } from '../core/repository';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { PageOption } from '../libs/types';
import { ITransaction, ITransactionBase } from './models/transaction.model';

const {
  generateCountSql,
  generateInsertSql,
  generateSelectSql,
  generateDeleteSql,
  generateUpdateSql,
} = MySqlQueryGenerator;

export class TransactionRepository
  implements ITransactionRepository<ITransactionBase, ITransaction>
{
  constructor(private readonly factory: PoolConnectionFactory) {}

  async create(data: ITransactionBase): Promise<ITransaction> {
    const dbConnection = await this.factory.acquirePoolConnection();
    try {
      const transaction: Omit<ITransaction, 'id'> = {
        ...data,
        status: 'Not returned',
      };

      const { sql, values } = generateInsertSql<ITransactionBase>(
        'transactions',
        transaction
      );

      const queryResult = await dbConnection.query<ResultSetHeader>(
        sql,
        values
      );
      const insertedTransaction = await this.getById(queryResult.insertId);

      if (!insertedTransaction) {
        throw new Error('Failed to retrieve the newly inserted transaction');
      }
      return insertedTransaction;
    } catch (error: any) {
      throw new Error(`Insertion failed: ${error.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async getById(id: number): Promise<ITransaction | null> {
    const dbConnection = await this.factory.acquirePoolConnection();
    try {
      const { sql, values } = generateSelectSql<ITransaction>(
        'transactions',
        [],
        {
          id: { op: 'EQUALS', value: id },
        }
      );
      const [result] = await dbConnection.query<RowDataPacket[]>(sql, values);
      return (result as ITransaction) || null;
    } catch (e: any) {
      throw new Error(`Selection failed: ${e.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async update(
    transactionId: number,
    returnDate: string
  ): Promise<ITransaction | null> {
    const dbConnection = await this.factory.acquireTransactionPoolConnection();
    try {
      const { sql: updateSql, values: updateValues } =
        generateUpdateSql<ITransaction>(
          'transactions',
          {
            returnDate: returnDate,
            status: 'Returned',
          },
          {
            id: {
              op: 'EQUALS',
              value: transactionId,
            },
            status: {
              op: 'EQUALS',
              value: 'Not Returned',
            },
          }
        );
      await dbConnection.query(updateSql, updateValues);
      const updatedTransaction = await this.getById(transactionId);

      if (!updatedTransaction) {
        throw new Error('Failed to retrieve the newly updated transaction');
      }
      await dbConnection.commit();
      return updatedTransaction;
    } catch (e: any) {
      await dbConnection.rollback();
      throw new Error(`Selection failed: ${e.message}`);
    } finally {
      await dbConnection.release();
    }
  }

  async list(params: IPageRequest): Promise<IPagedResponse<ITransactionBase>> {
    const connection = await this.factory.acquireTransactionPoolConnection();
    try {
      const pageOpts: PageOption = {
        offset: params.offset,
        limit: params.limit,
      };

      const { sql, values } = generateSelectSql<ITransaction>(
        'transactions',
        [],
        {},
        pageOpts
      );
      const transactions = await connection.query(sql, values);
      console.log(transactions);
      const countSqlData = generateCountSql<ITransaction>('transactions', {});
      const totalTransactionRows = await connection.query(
        countSqlData.sql,
        countSqlData.values
      );
      const totalTransaction = (totalTransactionRows as any)[0].COUNT;
      await connection.commit();
      return {
        items: transactions as ITransaction[],
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalTransaction,
        },
      };
    } catch (e: any) {
      await connection.rollback();
      throw new Error(`Listing Transactions failed: ${e.message}`);
    } finally {
      await connection.release();
    }
  }
}
