import { Router } from 'express';
import { loginStylist, logoutStylist } from '../controllers/authController.js';
import { limitStylistLoginAttempts } from '../middleware/authentication.js';

const router = Router();

router.post('/login', limitStylistLoginAttempts, loginStylist);
router.post('/logout', logoutStylist);

export default router;
