import { Query } from 'mysql2/typings/mysql/lib/protocol/sequences/Query';
import {
  WhereParamValue,
  AndWhereExpression,
  OrWhereExpression,
  SimpleWhereExpression,
  WhereExpression,
  PageOption,
  StringOperator,
} from './types';

export interface QueryResult {
  sql: string;
  values: any[];
}
const generateWhereClauseSql = <T>(
  whereParams: WhereExpression<T>
): QueryResult => {
  const values: any[] = [];
  const processSimpleExp = (exp: SimpleWhereExpression<T>) => {
    const whereQuery = Object.entries(exp)
      .map(([key, opts]) => {
        const columnName = `\`${key}\``;
        const paramValue: WhereParamValue = opts as WhereParamValue;
        let value = `${paramValue.value}`;
        let operator = '';

        if (paramValue.value === null) {
          if (paramValue.op === 'EQUALS') {
            operator = ' IS ';
          } else {
            operator = ' IS NOT ';
          }
        } else {
          switch (paramValue.op) {
            case 'EQUALS':
              operator = ' = ';
              break;

            case 'NOT_EQUALS':
              operator = ' != ';
              break;

            case 'STARTS_WITH':
              operator = ' LIKE ';
              value = `${value}%`;
              break;

            case 'NOT_STARTS_WITH':
              operator = ' NOT LIKE ';
              value = `${value}%`;
              break;

            case 'ENDS_WITH':
              operator = ' LIKE ';
              value = `%${value}`;
              break;

            case 'NOT_ENDS_WITH':
              operator = ' NOT LIKE ';
              value = `%${value}`;
              break;

            case 'CONTAINS':
              operator = ' LIKE ';
              value = `%${value}%`;
              break;

            case 'NOT_CONTAINS':
              operator = ' NOT LIKE ';
              value = `%${value}%`;
              break;

            case 'GREATER_THAN':
              operator = ' > ';
              break;

            case 'GREATER_THAN_EQUALS':
              operator = ' >= ';
              break;

            case 'LESSER_THAN':
              operator = ' < ';
              break;

            case 'LESSER_THAN_EQUALS':
              operator = ' <= ';
              break;
          }
        }

        if (typeof paramValue.value === 'string') {
          values.push(value);
        } else {
          values.push(Number(value));
        }

        return `${columnName}${operator}?`;
      })
      .join(' AND ');
    return whereQuery;
  };
  const whKeys = Object.keys(whereParams);

  if (whKeys.includes('AND')) {
    //it's an AndWhereExpression
    const andClause = (whereParams as AndWhereExpression<T>).AND.map((exp) => {
      const { sql, values: nestedValues } = generateWhereClauseSql(exp);
      values.push(...nestedValues);
      return sql;
    })
      .filter((c) => c)
      .join(' AND ');
    return { sql: andClause ? `(${andClause})` : '', values };
  } else if (whKeys.includes('OR')) {
    //it's an OrWhereExpression
    const orClause = (whereParams as OrWhereExpression<T>).OR.map((exp) => {
      const { sql, values: nestedValues } = generateWhereClauseSql(exp);
      values.push(...nestedValues);
      return sql;
    })
      .filter((c) => c)
      .join(' OR ');
    return { sql: orClause ? `(${orClause})` : '', values };
  } else {
    //it's a SimpleWhereExpression
    const simpleClause = processSimpleExp(
      whereParams as SimpleWhereExpression<T>
    );
    return { sql: simpleClause ? `(${simpleClause})` : '', values };
  }
};

const generateInsertSql = <T>(tableName: string, row: T): QueryResult => {
  const values: any[] = [];
  const columnNames = Object.entries(row as Object).reduce(
    (acc, [key, value]) => {
      acc.column.push(`\`${key}\``);
      values.push(value);
      acc.value.push(`?`);

      return acc;
    },
    { column: [] as Array<string>, value: [] as Array<string> }
  );

  let sql = `INSERT INTO \`${tableName}\` (${columnNames.column.join(
    ', '
  )}) VALUES (${columnNames.value.join(', ')})`;

  return { sql, values };
};

const generateUpdateSql = <T>(
  tableName: string,
  row: Partial<T>,
  where: WhereExpression<T>
): QueryResult => {
  const values: any[] = [];
  let sql = `UPDATE \`${tableName}\``;
  const updateColumn = Object.entries(row as Object)
    .map(([key, value]) => {
      values.push(value);
      return `${key} = ?`;
    })
    .join(', ');

  sql += ` SET ${updateColumn}`;
  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += ` WHERE ${whereClause.sql} `;
  }
  return { sql, values: [...values, ...whereClause.values] };
};

const generateDeleteSql = <T>(
  tableName: string,
  where: WhereExpression<T>
): QueryResult => {
  let sql = `DELETE FROM \`${tableName}\``;

  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += ` WHERE ${whereClause.sql} `;
  }
  return { sql, values: whereClause.values };
};

function sanitisifyingFields(rows: string[]) {
  return rows.map((row) => {
    let fieldWithBackticks = (row as string).startsWith('`')
      ? row
      : '`' + (row as string);
    fieldWithBackticks += (row as string).endsWith('`') ? '' : '`';
    return fieldWithBackticks;
  });
}

const generateSelectSql = <T>(
  tableName: string,
  column: (keyof T)[],
  where: WhereExpression<T>,
  pageOpts?: PageOption
): QueryResult => {
  const columnName =
    column.length > 0
      ? sanitisifyingFields(column as string[]).join(', ')
      : '*';
  let sql = `SELECT ${columnName} FROM \`${tableName}\``;

  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += ` WHERE ${whereClause.sql}`;
  }

  const values = [...whereClause.values];
  if (pageOpts?.limit) {
    sql += ` LIMIT ?`;
    values.push(`${pageOpts.limit}`);
  }
  if (pageOpts?.offset) {
    sql += ` OFFSET ?`;
    values.push(`${pageOpts?.offset}`);
  }

  return { sql, values };
};

const generateCountSql = <T>(
  tableName: string,
  where: WhereExpression<T>
): QueryResult => {
  let sql = `SELECT COUNT(*) AS \'COUNT\' FROM ${tableName} `;
  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += `WHERE ${whereClause.sql}`;
  }
  return { sql, values: whereClause.values };
};

export const MySqlQueryGenerator = {
  generateWhereClauseSql,
  generateInsertSql,
  generateUpdateSql,
  generateDeleteSql,
  generateSelectSql,
  generateCountSql,
};

export interface IMemberBase {
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  contactNo: string;
  email: string;
}

export interface IMember extends IMemberBase {
  id: number;
}
// (((firstName LIKE "Krish%") OR (lastName = "Dey")) AND (address LIKE "%West Bengal%" AND contactNo NOT LIKE "%00%"))
const generated = generateWhereClauseSql<Partial<IMember>>({
  OR: [
    {
      AND: [
        {
          OR: [
            {
              firstName: {
                op: 'STARTS_WITH' as StringOperator,
                value: 'Krish',
              },
            },
            {
              lastName: {
                op: 'EQUALS' as StringOperator,
                value: 'Dey',
              },
            },
          ],
        },
        {
          address: {
            op: 'CONTAINS',
            value: 'West Bengal',
          },
          contactNo: {
            op: 'NOT_CONTAINS',
            value: '00',
          },
        },
      ],
    },
  ],
});
