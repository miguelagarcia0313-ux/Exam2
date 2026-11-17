import { createStylistApplication as createApplication } from '../services/stylistApplicationService.js';

function createStylistApplication(req, res, next) {
    try {
        const application = createApplication(req.body);
        res.status(201).json({ application });
    } catch (error) {
        next(error);
    }
}

export { createStylistApplication };
