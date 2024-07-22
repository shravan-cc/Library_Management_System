import {
  ITransaction,
  ITransactionBase,
  RTransaction,
} from './models/transaction.model';
import { ITransactionRepository } from '../core/repository';
import { LibraryDataset } from '../db/library-dataset';
import { IPagedResponse, IPageRequest } from '../core/pagination.response';
import { MySQLDatabase } from '../db/library-db';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PageOption, WhereExpression } from '../libs/types';
import { Console } from 'console';

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

  async issueBook(data: ITransactionBase): Promise<ITransaction> {
    const dbConnection = await this.factory.acquirePoolConnection();
    try {
      const transaction: Omit<ITransaction, 'id'> = {
        ...data,
        status: 'Not returned',
      };

      const { sql: insertSql, values: insertValues } =
        generateInsertSql<ITransactionBase>('transactions', transaction);

      const queryResult = await dbConnection.query<ResultSetHeader>(
        insertSql,
        insertValues
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

  async returnBook(
    transactionId: number,
    returnDate: string
  ): Promise<ITransaction | null> {
    const dbConnection = await this.factory.acquirePoolConnection();
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
      return updatedTransaction;
    } catch (e: any) {
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
      const countSqlData = generateCountSql<ITransaction>('Transactions', {});
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
