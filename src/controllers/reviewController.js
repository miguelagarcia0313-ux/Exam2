import { createReview as createReviewRecord } from '../services/reviewService.js';

function createReview(req, res) {
    const review = createReviewRecord(req.body);
    res.status(201).json({ review });
}

export { createReview };
