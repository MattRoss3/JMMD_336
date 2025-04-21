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

    // get challenge
    let sqlChallenge = `SELECT * FROM challenges WHERE challenges.challengeId = ?`;
    const [selectedChallengeRows] = await pool.query(sqlChallenge, [challengeId]);
    console.log(selectedChallengeRows);

    // get questions for challenge
    let sqlQuestions = `SELECT * FROM questions WHERE questions.challengeId = ?`;
    const [questionRows] = await pool.query(sqlQuestions, challengeId);
    console.log(questionRows);

    // // get answers for question
    // let sqlAnswers = `SELECT * FROM answers WHERE answers.questionId = ? AND answers.isCorrect = 1`;
    // const [answerRows] = await pool.query(sqlAnswers, [currQuestion.questionId]);
    // console.log(answerRows);

    req.session.questionIndex = 0;
    req.session.attemptCounter = 1;
    req.session.correctCounter = 0;
    req.session.incorrectCounter = 0;
    req.session.selectedChallenge = selectedChallengeRows;
    req.session.questionList = questionRows;
    req.session.questionCount = questionRows.length;
    // req.session.answerList = answerRows;

    let questionIndex = req.session.questionIndex;
    let attemptCounter = req.session.attemptCounter;
    let selectedChallenge = req.session.selectedChallenge;
    let questionList = req.session.questionList;
    // let answerList = req.session.answerList;

    // update user progress
    let sqlProgress = `UPDATE progress SET status = ?, level = ? WHERE userId = ? AND challengeId = ?`;
    const [progressRows] = await pool.query(sqlProgress, ["in progress", req.session.correctCounter, req.session.userId, challengeId]);

    res.render('challengeFormat', { message: null, questionIndex, attemptCounter, selectedChallenge, questionList });
  } catch (err) {
    next(err);
  }
}

export async function getWriteInQuestions(req, res, next) {
  try {
    req.session.format = "writein";

    let questionIndex = req.session.questionIndex;
    let attemptCounter = req.session.attemptCounter;
    let selectedChallenge = req.session.selectedChallenge;
    let questionList = req.session.questionList;

    let currQuestion = questionList[questionIndex];

    res.render('writeInChallenge', { message: null, "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });
  } catch (err) {
    next(err);
  }
}

export async function getMultipleChoiceQuestions(req, res, next) {
  try {
    req.session.format = "multiplechoice";

    let questionIndex = req.session.questionIndex;
    let attemptCounter = req.session.attemptCounter;
    let selectedChallenge = req.session.selectedChallenge;
    let questionList = req.session.questionList;

    let currQuestion = questionList[questionIndex];

    // get answers for question
    let sqlAnswers = `SELECT * FROM answers WHERE answers.questionId = ?`;
    const [answerRows] = await pool.query(sqlAnswers, [currQuestion.questionId]);
    req.session.answerList = answerRows;
    let answerList = req.session.answerList;
    console.log(answerRows);

    res.render('multipleChoiceChallenge', { message: null, "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "answerList":answerList, "attemptCounter":attemptCounter });
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

    let currQuestion = questionList[questionIndex];
    let challengeId = currQuestion.challengeId;

    // // get answers for question
    // let sqlAnswers = `SELECT * FROM answers WHERE answers.questionId = ?`;
    // const [answerRows] = await pool.query(sqlAnswers, [currQuestion.questionId]);
    // let answerList = answerRows;
    // console.log(answerRows);

    // get correct answer
    let sqlCorrectAnswer = `SELECT * FROM answers WHERE answers.questionId = ? AND answers.isCorrect = 1`;
    const [correctAnswerRows] = await pool.query(sqlCorrectAnswer, [currQuestion.questionId]);
    correctAnswer = correctAnswerRows[0];

    req.session.attemptCounter += 1;
    req.session.questionIndex += 1;

    // move to the next question in the list and update the attempt counter
    currQuestion = questionList[req.session.questionIndex];
    attemptCounter = req.session.attemptCounter;

    // if (req.session.format == "multiplechoice") {
    //   correctAnswer = req.body.input[name=userAnswer]:checked").value;
    //
    //   document.querySelector("input[name=q4]:checked").value;
    // }

    // check if user answer is correct
    if (userAnswer == correctAnswer.answerText) {

      req.session.correctCounter += 1;

      // update user progress
      let sqlProgress = `UPDATE progress SET status = ?, level = ? WHERE userId = ? AND challengeId = ?`;
      const [progressRows] = await pool.query(sqlProgress, ["in progress", req.session.correctCounter, req.session.userId, challengeId]);
      console.log(progressRows);

      let correctCounter = req.session.correctCounter;
      let incorrectCounter = req.session.incorrectCounter;
      let questionCount = req.session.questionCount;

      if (attemptCounter > req.session.questionCount) {
        // update user progress
        let sqlProgress = `UPDATE progress SET status = ?, level = ? WHERE userId = ? AND challengeId = ?`;
        const [progressRows] = await pool.query(sqlProgress, ["completed", req.session.correctCounter, req.session.userId, challengeId]);
        console.log(progressRows);

        res.render('challengeResults', { message: "CONGRATS!", correctCounter, incorrectCounter, questionCount });
      }

      if (req.session.format == "writein") {
        res.render('writeInChallenge', { message: "CORRECT!", "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });
      } else if (req.session.format == "multiplechoice") {
        // get answers for next question
        let sqlAnswers = `SELECT * FROM answers WHERE answers.questionId = ?`;
        const [answerRows] = await pool.query(sqlAnswers, [currQuestion.questionId]);
        let answerList = answerRows;
        console.log(answerRows);

        res.render('multipleChoiceChallenge', { message: "CORRECT!", "selectedChallenge":selectedChallenge, "questionList":questionList, "answerList":answerList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });
      } else {
        // unforeseen error
      }

    } else {
      req.session.incorrectCounter += 1;

      let correctCounter = req.session.correctCounter;
      let incorrectCounter = req.session.incorrectCounter;
      let questionCount = req.session.questionCount;

      if (attemptCounter > req.session.questionCount) {
        // update user progress
        let sqlProgress = `UPDATE progress SET status = ?, level = ? WHERE userId = ? AND challengeId = ?`;
        const [progressRows] = await pool.query(sqlProgress, ["completed", req.session.correctCounter, req.session.userId, challengeId]);
        console.log(progressRows);

        res.render('challengeResults', { message: "You failed!", correctCounter, incorrectCounter, questionCount });
      }
      if (req.session.format == "writein") {
        res.render('writeInChallenge', { message: "INCORRECT!", "selectedChallenge":selectedChallenge, "questionList":questionList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });
      } else if (req.session.format == "multiplechoice") {

        // get answers for next question
        let sqlAnswers = `SELECT * FROM answers WHERE answers.questionId = ?`;
        const [answerRows] = await pool.query(sqlAnswers, [currQuestion.questionId]);
        let answerList = answerRows;
        console.log(answerRows);

        res.render('multipleChoiceChallenge', { message: "INCORRECT!", "selectedChallenge":selectedChallenge, "questionList":questionList, "answerList":answerList, "currQuestion":currQuestion, "questionIndex":questionIndex, "attemptCounter":attemptCounter });
      } else {
        // unforeseen error
      }
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