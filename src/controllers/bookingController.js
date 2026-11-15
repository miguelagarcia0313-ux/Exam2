import { createBooking as createBookingRequest } from '../services/bookingService.js';

function createBooking(req, res, next) {
    try {
        const booking = createBookingRequest(req.body);
        res.status(201).json({ booking });
    } catch (error) {
        next(error);
    }
}

export { createBooking };
