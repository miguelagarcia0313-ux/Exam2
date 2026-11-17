import { Router } from 'express';
import {
    renderBecomeStylist,
    renderHome,
    renderStylistLogin,
    renderStylistProfile
} from '../controllers/pageController.js';
import { requireStylistPageAuth } from '../middleware/authentication.js';

const router = Router();

router.get('/', renderHome);
router.get('/stylist/login', renderStylistLogin);
router.get('/stylist/profile', requireStylistPageAuth, renderStylistProfile);
router.get('/become-a-stylist', renderBecomeStylist);

export default router;
