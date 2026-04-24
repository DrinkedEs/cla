import mysql, { type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __laDentalPool: Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false
  });
}

export const db = globalThis.__laDentalPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__laDentalPool = db;
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  values: unknown[] = []
) {
  const [rows] = await db.query<T[]>(sql, values);
  return rows[0] ?? null;
}
