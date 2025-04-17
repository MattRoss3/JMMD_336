import { pool } from '../../config/db.mjs';

/**
 * Insert a new challenge into challenges → questions → answers.
 *
 * @param {{ title, description, questions }} challengeObj
 * @param {string} category     // language/category
 * @param {string} displayType  // 'choice' | 'write_in' | 'prompt'
 * @returns {Promise<number>}   newly created challengeId
 */
export async function insertGlobalChallenge(challengeObj, category, displayType) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Insert challenge metadata, including displayType
    const [cRes] = await conn.execute(
      `INSERT INTO challenges
         (name, description, category, displayType, isAssigned)
       VALUES (?,    ?,           ?,        ?,           FALSE)`,
      [
        challengeObj.title,
        challengeObj.description,
        category,
        displayType
      ]
    );
    const challengeId = cRes.insertId;

    // 2) Insert each question + its answers
    for (const q of challengeObj.questions) {
      const [qRes] = await conn.execute(
        `INSERT INTO questions (challengeId, questionText, language)
         VALUES (?, ?, ?)`,
        [challengeId, q.questionText, category]
      );
      const questionId = qRes.insertId;

      for (const a of q.answers) {
        await conn.execute(
          `INSERT INTO answers (questionId, answerText, isCorrect)
           VALUES (?, ?, ?)`,
          [questionId, a.text, a.isCorrect ? 1 : 0]
        );
      }
    }

    await conn.commit();
    return challengeId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}