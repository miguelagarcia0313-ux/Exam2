import { Router } from 'express';
import { listStylists, getStylist } from '../controllers/stylistController.js';
import { createBooking } from '../controllers/bookingController.js';
import { createReview } from '../controllers/reviewController.js';
import { updateStylistProfile } from '../controllers/stylistProfileController.js';
import { createStylistApplication } from '../controllers/stylistApplicationController.js';
import { requireStylistApiAuth } from '../middleware/authentication.js';

const router = Router();

router.get('/stylists', listStylists);
router.get('/stylists/:id', getStylist);
router.patch('/stylists/:id/profile', requireStylistApiAuth, updateStylistProfile);
router.post('/bookings', createBooking);
router.post('/reviews', createReview);
router.post('/stylist-applications', createStylistApplication);

export default router;
