import { createAndAssign } from '../services/challengeService.mjs';
import { pool } from '../../config/db.mjs';  // for dashboard

export function getCreateForm(req, res) {
  res.render('createChallenge', { message: null });
}

export async function postGenerate(req, res, next) {
  try {
    const userId = req.session.userId;
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

export async function displayFormatChoice(req, res, next) {
  try {
    let challengeId = req.query.challengeId;

    let sql = `SELECT * FROM challenges WHERE challenges.challengeId = ?`;
    const [selectedChallengeRows] = await pool.query(sql, [challengeId]);
    console.log(selectedChallengeRows);

    // let sqlQuestions = `SELECT * FROM questions INNER JOIN challenges ON questions.challengeId = challenges.challengeId`;
    let sqlQuestions = `SELECT * FROM questions WHERE questions.challengeId = ?`;

    const [questionRows] = await pool.query(sqlQuestions, challengeId);
    console.log(questionRows);

    req.session.questionIndex = 0;
    req.session.attemptCounter = 1;
    req.session.correctCounter = 0;
    req.session.incorrectCounter = 0;
    req.session.selectedChallenge = selectedChallengeRows;
    req.session.questionList = questionRows;

    let questionIndex = req.session.questionIndex;
    let attemptCounter = req.session.attemptCounter;
    let selectedChallenge = req.session.selectedChallenge;
    let questionList = req.session.questionList;
    console.log(questionList.length);

    // update user progress
    let sqlProgress = `UPDATE progress SET status = ?, level = ? WHERE userId = ? AND challengeId = ?`;
    const [progressRows] = await pool.query(sqlProgress, ["in progress", req.session.correctCounter, req.session.userId, challengeId]);
    // console.log(progressRows);

    // let sqlQuestions = `SELECT * FROM questions INNER JOIN challenges ON questions.challengeId = challenges.challengeId`;
    // const [questionRows] = await pool.query(sqlQuestions);
    // console.log(questionRows);
    //
    // // req.session.challengeId = challengeId;
    // req.session.selectedChallenge = selectedChallengeRows;
    //
    // req.session.questionIndex = 0;
    // req.session.attemptCounter = 1;
    //
    // req.session.questionList = questionRows;

    res.render('challengeFormat', { message: null, questionIndex, attemptCounter, selectedChallenge, questionList });
    // res.render('challengeFormat', { message: null, "selectedChallenge":selectedChallengeRows });
  } catch (err) {
    next(err);
  }
}

export async function getWriteInQuestions(req, res, next) {
  try {
    let challengeId = req.query.challengeId;

    // let sqlChallenge = `SELECT * FROM challenges WHERE challenges.challengeId = ?`;
    // const [selectedChallengeRows] = await pool.query(sqlChallenge, [challengeId]);
    // console.log(selectedChallengeRows);

    // let sqlQuestions = `SELECT * FROM questions INNER JOIN challenges ON questions.challengeId = challenges.challengeId`;
    // const [questionRows] = await pool.query(sqlQuestions);
    // console.log(questionRows);



    let questionIndex = req.session.questionIndex;
    let attemptCounter = req.session.attemptCounter;
    let selectedChallenge = req.session.selectedChallenge;
    let questionList = req.session.questionList;

    let currQuestion = questionList[req.session.questionIndex];

    // res.render('writeInChallenge', { message: null, selectedChallenge, questionIndex, attemptCounter, questionList });

    res.render('writeInChallenge', { message: null, "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });
  } catch (err) {
    next(err);
  }
}


export async function checkAnswer(req, res, next) {
  try {
    let userAnswer = req.body.userAnswer;
    let correctAnswer = "";


    let questionIndex = req.session.questionIndex;
    let attemptCounter = req.session.attemptCounter;
    let selectedChallenge = req.session.selectedChallenge;
    let questionList = req.session.questionList;


    let currQuestion = questionList[req.session.questionIndex];
    let challengeId = currQuestion.challengeId;


    // get correct answer
    let sql = `SELECT * FROM answers WHERE answers.questionId = ? AND answers.isCorrect = 1`;
    const [correctAnswerRows] = await pool.query(sql, [currQuestion.questionId]);
    console.log(correctAnswerRows);

    correctAnswer = correctAnswerRows[0];

    req.session.attemptCounter += 1;
    req.session.questionIndex += 1;

    currQuestion = questionList[req.session.questionIndex];
    attemptCounter = req.session.attemptCounter;

    if (userAnswer == correctAnswer.answerText) {
      // record
      req.session.correctCounter += 1;

      // update user progress
      let sqlProgress = `UPDATE progress SET status = ?, level = ? WHERE userId = ? AND challengeId = ?`;
      const [progressRows] = await pool.query(sqlProgress, ["in progress", req.session.correctCounter, req.session.userId, challengeId]);
      console.log(progressRows);

      res.render('writeInChallenge', { message: "CORRECT!", "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });

    } else {
      req.session.incorrectCounter += 1;

      res.render('writeInChallenge', { message: "INCORRECT!", "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });

    }

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