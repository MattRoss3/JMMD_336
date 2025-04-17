import { createAndAssign } from '../services/challengeService.mjs';
import { pool }            from '../../config/db.mjs';  // for dashboard

export function getCreateForm(req, res) {
  res.render('createChallenge', { message: null });
}

export async function postGenerate(req, res, next) {
  try {
    const userId        = req.session.userId;
    const { language, level, numQuestions, displayType } = req.body;

    if (!language || !level || !numQuestions || !displayType) {
      return res.render('createChallenge', { message: 'All fields are required.' });
    }

    // Pass displayType through
    await createAndAssign(
      userId,
      language,
      level,
      Number(numQuestions),
      displayType
    );

    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const userId = req.session.userId;
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM userChallenges WHERE userId = ?`,
      [userId]
    );
    const [assignments] = await pool.query(
      `SELECT
         c.challengeId,
         c.name   AS title,
         COALESCE(p.status, 'not started') AS status
       FROM userChallenges uc
       JOIN challenges c
         ON c.challengeId = uc.challengeId
       LEFT JOIN progress p
         ON p.userId       = uc.userId
        AND p.challengeId = c.challengeId
       WHERE uc.userId = ?`,
      [userId]
    );

    res.render('dashboard', { total, assignments });
  } catch (err) {
    next(err);
  }
}