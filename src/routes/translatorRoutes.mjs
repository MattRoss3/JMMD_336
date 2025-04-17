import { Router } from 'express';
import authenticated from '../middleware/authenticated.mjs';
import {
  getTranslator,
  postTranslator
} from '../controllers/translatorController.mjs';

const router = Router();

// Protect translator endpoint
router.use(authenticated);

router.get('/translator', getTranslator);
router.post('/translator', postTranslator);

export default router;