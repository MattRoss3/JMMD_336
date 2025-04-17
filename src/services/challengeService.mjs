import { insertGlobalChallenge } from '../models/challengeModel.mjs';
import { assignChallengeToUser } from '../models/userChallengeModel.mjs';
import { generateLanguageChallenge } from './openaiService.mjs';

/**
 * Orchestrates:
 *  1) OpenAI generation
 *  2) Insert challenge (with displayType)
 *  3) Assign to user + init progress
 *
 * @param {number} userId
 * @param {string} language
 * @param {string} level
 * @param {number} numQuestions
 * @param {string} displayType    // 'choice' | 'write_in' | 'prompt'
 */
export async function createAndAssign(
  userId, language, level, numQuestions, displayType
) {
  // 1) generate via OpenAI
  const challengeObj = await generateLanguageChallenge(language, level, numQuestions);

  // 2) insert into challenges/questions/answers
  const challengeId = await insertGlobalChallenge(
    challengeObj,
    language,
    displayType
  );

  // 3) assign to user + init progress
  await assignChallengeToUser(userId, challengeId, level);
}