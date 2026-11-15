import { randomUUID } from 'node:crypto';
import { findBookingById } from './bookingService.js';

const reviews = [];

function fail(status, message) {
    const error = new Error(message);
    error.status = status;
    throw error;
}

export function listReviews(stylistId) {
    return reviews
        .filter((review) => review.stylistId === stylistId)
        .map((review) => ({ ...review }));
}

export function createReview(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        fail(400, 'A review request is required.');
    }

    const { bookingId, rating, comment } = input;
    if (typeof bookingId !== 'string' || !bookingId) fail(400, 'A booking is required to leave a review.');
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        fail(400, 'Choose a rating from 1 to 5.');
    }
    if (typeof comment !== 'string' || comment.trim().length < 5 || comment.trim().length > 1000) {
        fail(400, 'Enter a review between 5 and 1,000 characters.');
    }

    const booking = findBookingById(bookingId);
    if (!booking) fail(404, 'Booking not found.');

    const appointmentDate = new Date(`${booking.date}T${booking.time}:00`);
    if (appointmentDate >= new Date()) fail(409, 'You can review this booking after the appointment.');
    if (reviews.some((review) => review.bookingId === booking.id)) {
        fail(409, 'This booking already has a review.');
    }

    const review = {
        id: randomUUID(),
        bookingId: booking.id,
        stylistId: booking.stylistId,
        reviewer: booking.clientName,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString()
    };

    reviews.push(review);
    return { ...review };
}
