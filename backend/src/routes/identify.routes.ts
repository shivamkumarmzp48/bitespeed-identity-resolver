import { Router } from 'express';
import { identify } from '../controllers/identify.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, identify);

export default router;