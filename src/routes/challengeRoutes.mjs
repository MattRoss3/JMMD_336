import { Router } from 'express';
import {
  getCreateForm,
  postGenerate,
  displayFormatChoice,
  getWriteInQuestions,
  promptQuestion,
  checkAnswer
} from '../controllers/challengeController.mjs';
import authenticated from '../middleware/authenticated.mjs';

const router = Router();
router.use(authenticated);
router.get('/',         getCreateForm);
router.post('/generate',postGenerate);

router.get('/format_prompt', displayFormatChoice);

router.get('/writein', getWriteInQuestions);
// router.get('/writein', promptQuestion);
// router.get('/multiplechoice', displayMultipleChoiceQuestion);
//
router.post('/checkAnswer', checkAnswer);

export default router;