import { Router } from 'express';
import { listStylists, getStylist } from '../controllers/stylistController.js';
import { createBooking } from '../controllers/bookingController.js';
import { createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/stylists', listStylists);
router.get('/stylists/:id', getStylist);
router.post('/bookings', createBooking);
router.post('/reviews', createReview);

export default router;
