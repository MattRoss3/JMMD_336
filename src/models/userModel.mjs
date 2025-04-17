import { pool } from '../../config/db.mjs';

/** by username */
export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    `SELECT userId, firstName, lastName, username, password
       FROM users
      WHERE username = ?`,
    [username]
  );
  return rows[0] ?? null;
}

/** by ID */
export async function findUserById(userId) {
  const [rows] = await pool.query(
    `SELECT userId, firstName, lastName, username, password
       FROM users
      WHERE userId = ?`,
    [userId]
  );
  return rows[0] ?? null;
}

/** create new user */
export async function createUser({ firstName, lastName, username, passwordHash }) {
  await pool.execute(
    `INSERT INTO users (firstName, lastName, username, password, isAdmin)
     VALUES (?, ?, ?, ?, 0)`,
    [firstName, lastName, username, passwordHash]
  );
}

/** update profile info */
export async function updateUserInfo(userId, username, firstName, lastName) {
  await pool.execute(
    `UPDATE users
        SET username = ?, firstName = ?, lastName = ?
      WHERE userId = ?`,
    [username, firstName, lastName, userId]
  );
}

/** update password */
export async function updateUserPassword(userId, passwordHash) {
  await pool.execute(
    `UPDATE users
        SET password = ?
      WHERE userId = ?`,
    [passwordHash, userId]
  );
}