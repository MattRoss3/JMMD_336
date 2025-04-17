import { Router } from 'express';
import {
  getCreateForm,
  postGenerate
} from '../controllers/challengeController.mjs';
import authenticated from '../middleware/authenticated.mjs';

const router = Router();
router.use(authenticated);
router.get('/',         getCreateForm);
router.post('/generate',postGenerate);
export default router;