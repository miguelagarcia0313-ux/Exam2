import {
    clearSessionCookie,
    createSessionCookie,
    createStylistSession,
    destroyStylistSession
} from '../services/authService.js';
import {
    clearStylistLoginFailures,
    recordStylistLoginFailure
} from '../services/loginAttemptService.js';

function loginStylist(req, res, next) {
    try {
        const token = createStylistSession(req.body.password);
        clearStylistLoginFailures(req.ip || 'unknown');
        res.set('Set-Cookie', createSessionCookie(token));
        res.redirect(303, '/stylist/profile');
    } catch (error) {
        if (error.status === 401) {
            recordStylistLoginFailure(req.ip || 'unknown');
            return res.redirect(303, '/stylist/login?error=invalid');
        }
        next(error);
    }
}

function logoutStylist(req, res) {
    destroyStylistSession(req.stylistSession);
    res.set('Set-Cookie', clearSessionCookie());
    res.redirect(303, '/');
}

export { loginStylist, logoutStylist };
