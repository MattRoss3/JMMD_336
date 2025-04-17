import { Router } from 'express';
import authenticated from '../middleware/authenticated.mjs';
import {
  getUpdate,
  postUpdate,
  postUpdatePassword
} from '../controllers/userController.mjs';

const router = Router();

// All /update* routes require login
router.use(authenticated);

router.get('/update',             getUpdate);
router.post('/update',            postUpdate);
router.post('/updatepassword',    postUpdatePassword);

export default router;