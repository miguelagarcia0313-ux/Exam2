import { createReview as createReviewRequest } from '../services/reviewService.js';

function createReview(req, res, next) {
    try {
        const review = createReviewRequest(req.body);
        res.status(201).json({ review });
    } catch (error) {
        next(error);
    }
}

export { createReview };
