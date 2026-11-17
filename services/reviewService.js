import { randomUUID } from 'node:crypto';
import stylists from '../data/stylists.js';
import { findBooking } from './bookingService.js';

const reviews = [];

function createReview(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw Object.assign(new Error('Add the required review details.'), { status: 400 });
    }
    const { bookingId, rating, comment } = input;
    const booking = findBooking(bookingId);
    if (!booking) {
        throw Object.assign(new Error('A confirmed booking is required to leave a review.'), { status: 404 });
    }
    const appointmentTime = new Date(`${booking.date}T${booking.time}`);
    if (appointmentTime > new Date()) {
        throw Object.assign(new Error('You can leave a review after your appointment.'), { status: 409 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw Object.assign(new Error('Choose a rating from 1 to 5.'), { status: 400 });
    }
    if (typeof comment !== 'string' || comment.trim().length < 5 || comment.length > 1000) {
        throw Object.assign(new Error('Write a review between 5 and 1,000 characters.'), { status: 400 });
    }
    if (reviews.some((review) => review.bookingId === bookingId)) {
        throw Object.assign(new Error('A review has already been submitted for this booking.'), { status: 409 });
    }

    const review = {
        id: randomUUID(),
        bookingId,
        stylistId: booking.stylistId,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
    };
    reviews.push(review);

    const stylist = stylists.find((item) => item.id === booking.stylistId);
    const previousTotal = stylist.rating * stylist.reviews;
    stylist.reviews += 1;
    stylist.rating = Number(((previousTotal + rating) / stylist.reviews).toFixed(2));
    return review;
}

function listReviews(stylistId) {
    return reviews
        .filter((review) => review.stylistId === stylistId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export { createReview, listReviews };
