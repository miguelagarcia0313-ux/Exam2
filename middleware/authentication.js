import {
    findStylistSession,
    sessionCookieName
} from '../services/authService.js';
import { isStylistLoginBlocked } from '../services/loginAttemptService.js';

function getRequestCookie(req) {
    const cookieHeader = req.headers.cookie || '';
    const escapedName = sessionCookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedName}=([a-f0-9]{64})(?:;|$)`));
    return match ? match[1] : null;
}

function loadStylistSession(req, res, next) {
    req.stylistSession = findStylistSession(getRequestCookie(req));
    res.locals.isStylistAuthenticated = Boolean(req.stylistSession);
    next();
}

function requireStylistPageAuth(req, res, next) {
    if (!req.stylistSession) return res.redirect(303, '/stylist/login');
    res.set('Cache-Control', 'no-store');
    next();
}

function requireStylistApiAuth(req, res, next) {
    if (!req.stylistSession) {
        return res.status(401).json({ error: 'Stylist sign-in is required to edit this profile.' });
    }
    res.set('Cache-Control', 'no-store');
    next();
}

function limitStylistLoginAttempts(req, res, next) {
    const address = req.ip || 'unknown';
    if (isStylistLoginBlocked(address)) {
        return res.redirect(303, '/stylist/login?error=locked');
    }
    next();
}

export {
    limitStylistLoginAttempts,
    loadStylistSession,
    requireStylistApiAuth,
    requireStylistPageAuth
};
