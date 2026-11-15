import { createBooking as createBookingRecord } from '../services/bookingService.js';

function createBooking(req, res) {
    const booking = createBookingRecord(req.body);
    res.status(201).json({ booking });
}

export { createBooking };
