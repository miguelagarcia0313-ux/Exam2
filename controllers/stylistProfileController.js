import { updateStylistProfile as updateProfile } from '../services/stylistProfileService.js';

function updateStylistProfile(req, res, next) {
    try {
        const stylist = updateProfile(req.params.id, req.body);
        res.json({ stylist });
    } catch (error) {
        next(error);
    }
}

export { updateStylistProfile };
