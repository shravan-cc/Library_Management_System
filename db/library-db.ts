import { KeySchema, unknown } from 'zod';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { PageOption, WhereExpression } from '../libs/types';
import { AppEnvs } from '../read-env';
import { MySQLAdapter } from './mysqldb';
import { D } from 'vitest/dist/reporters-yx5ZTtEV';
const {
  generateCountSql,
  generateInsertSql,
  generateSelectSql,
  generateDeleteSql,
  generateUpdateSql,
} = MySqlQueryGenerator;

export class Database<DS> {
  constructor(private readonly adapter: MySQLAdapter) {}

  async select<T extends keyof DS>(
    tableName: T,
    column: (keyof DS[T])[],
    where: WhereExpression<DS[T]>,
    pageOpts?: PageOption
  ) {
    try {
      const { sql, values } = generateSelectSql<DS[T]>(
        tableName as string,
        column,
        where,
        pageOpts
      );
      const result = await this.adapter.runQuery(sql, values);
      return result;
    } catch {
      throw new Error(`select query failed!!!!`);
    }
  }

  async insert<T extends keyof DS>(tableName: T, row: Omit<DS[T], 'id'>) {
    try {
      const { sql, values } = generateInsertSql<Omit<DS[T], 'id'>>(
        tableName as string,
        row
      );
      const result = await this.adapter.runQuery(sql, values);
      return result;
    } catch {
      throw new Error(`Insert query failed!!!!`);
    }
  }

  async update<T extends keyof DS>(
    tableName: T,
    row: Partial<DS[T]>,
    where: WhereExpression<DS[T]>
  ) {
    try {
      const { sql, values } = generateUpdateSql<DS[T]>(
        tableName as string,
        row,
        where
      );
      const result = await this.adapter.runQuery(sql, values);
      return result;
    } catch {
      throw new Error(`Update query failed!!!!`);
    }
  }

  async delete<T extends keyof DS>(
    tableName: T,
    where: WhereExpression<DS[T]>
  ) {
    try {
      const { sql, values } = generateDeleteSql<DS[T]>(
        tableName as string,
        where
      );
      const result = await this.adapter.runQuery(sql, values);
      return result;
    } catch {
      throw new Error(`Delete query failed!!!!`);
    }
  }

  async count<T extends keyof DS>(tableName: T, where: WhereExpression<DS[T]>) {
    try {
      const { sql, values } = generateCountSql<DS[T]>(
        tableName as string,
        where
      );
      const result = await this.adapter.runQuery(sql, values);
      return result;
    } catch {
      throw new Error(`Count query failed!!!!`);
    }
  }
}
