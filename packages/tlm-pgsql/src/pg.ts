import { Pool, PoolClient } from "pg";

type DatabaseAction<T> = (client: PoolClient) => Promise<T>;

export async function tx<T>(pool: Pool, action: DatabaseAction<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result: T = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignored
    }
    throw e;
  } finally {
    client.release();
  }
}
