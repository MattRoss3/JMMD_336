import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../config/env.mjs';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function generateLanguageChallenge(language, level, numQuestions) {
  const prompt = `
Generate exactly ${numQuestions} questions for a ${level} ${language} learner.
Each question must include a non-empty "questionText" and exactly 4 answers (one correct).
Reply ONLY with the JSON object (no extra text).
`;

  const fnDef = {
    name: 'generate_language_challenge',
    description: 'Creates a language learning challenge',
    parameters: {
      type: 'object',
      properties: {
        title:       { type: 'string' },
        description: { type: 'string' },
        questions: {
          type: 'array',
          minItems: numQuestions,
          maxItems: numQuestions,
          items: {
            type: 'object',
            properties: {
              questionText: { type: 'string' },
              answers: {
                type: 'array',
                minItems: 4,
                maxItems: 4,
                items: {
                  type: 'object',
                  properties: {
                    text:      { type: 'string' },
                    isCorrect: { type: 'boolean' }
                  },
                  required: ['text','isCorrect']
                }
              }
            },
            required: ['questionText','answers']
          }
        }
      },
      required: ['title','description','questions']
    }
  };

  // call the v4 SDK
  const resp = await openai.chat.completions.create({
    model:        'gpt-4o-2024-08-06',
    messages:     [
      { role:'system', content:'You are an expert at structured JSON output.' },
      { role:'user',   content: prompt }
    ],
    functions:     [fnDef],
    function_call: { name: fnDef.name },
    temperature:   0.7
  });

  const choice = resp.choices?.[0];
  if (!choice) {
    throw new Error('No choices returned from OpenAI');
  }

  // 1) try function_call.arguments
  let raw;
  if (choice.message?.function_call?.arguments) {
    raw = choice.message.function_call.arguments;
  }
  // 2) otherwise, try content
  else if (choice.message?.content) {
    raw = choice.message.content;
  } else {
    // nothing to parse
    throw new Error(
      'OpenAI response missing both function_call.arguments and content:\n' +
      JSON.stringify(choice, null, 2)
    );
  }

  // 3) parse JSON
  let args;
  try {
    args = JSON.parse(raw);
  } catch (e) {
    throw new Error('Failed to JSON.parse the model output:\n' + raw + '\n' + e.message);
  }

  // 4) minimal validation
  if (typeof args.title !== 'string' || !args.title) {
    throw new Error('Missing or invalid title in response JSON');
  }
  if (!Array.isArray(args.questions) || args.questions.length !== numQuestions) {
    throw new Error(`Expected ${numQuestions} questions but got ${args.questions?.length}`);
  }

  return args;
}