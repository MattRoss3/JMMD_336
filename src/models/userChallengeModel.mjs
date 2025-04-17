import { pool } from '../../config/db.mjs';

export async function assignChallengeToUser(userId, challengeId, level) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO userChallenges (userId, challengeId) VALUES (?, ?)`,
      [userId, challengeId]
    );
    await conn.execute(
      `INSERT INTO progress (userId, challengeId, status, level)
       VALUES (?, ?, 'not started', ?)`,
      [userId, challengeId, level]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}