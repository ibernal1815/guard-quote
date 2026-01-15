/**
 * PostgreSQL Connection using postgres.js
 * Connected to Raspberry Pi PostgreSQL
 */
import postgres from "postgres";

export const sql = postgres("postgres://guardquote:WPU8bj3nbwFyZFEtHZQz@192.168.2.70/guardquote", {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as ok`;
    return result[0].ok === 1;
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    return false;
  }
}

export async function closeConnection() {
  await sql.end();
}
