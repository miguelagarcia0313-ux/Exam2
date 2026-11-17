import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const sessionCookieName = 'dapper_stylist_session';
const sessionLifetimeMs = 30 * 60 * 1000;
const sessions = new Map();

function isStylistEditorConfigured() {
    const password = process.env.STYLIST_EDITOR_PASSWORD;
    return typeof password === 'string' && password.length >= 16;
}

function createStylistSession(password) {
    const configuredPassword = process.env.STYLIST_EDITOR_PASSWORD;
    if (typeof configuredPassword !== 'string' || configuredPassword.length < 16) {
        throw Object.assign(
            new Error('Stylist sign-in is unavailable. Configure STYLIST_EDITOR_PASSWORD with at least 16 characters.'),
            { status: 503 }
        );
    }

    const submittedPassword = typeof password === 'string' && password.length <= 256 ? password : '';
    const submittedHash = createHash('sha256').update(submittedPassword).digest();
    const configuredHash = createHash('sha256').update(configuredPassword).digest();
    if (!timingSafeEqual(submittedHash, configuredHash)) {
        throw Object.assign(new Error('Invalid sign-in credentials.'), { status: 401 });
    }

    const now = Date.now();
    for (const [token, expiresAt] of sessions) {
        if (expiresAt <= now) sessions.delete(token);
    }

    const token = randomBytes(32).toString('hex');
    sessions.set(token, now + sessionLifetimeMs);
    return token;
}

function findStylistSession(token) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;

    const expiresAt = sessions.get(token);
    if (!expiresAt || expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
    }

    return token;
}

function destroyStylistSession(token) {
    if (typeof token === 'string') sessions.delete(token);
}

function createSessionCookie(token) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const expires = new Date(Date.now() + sessionLifetimeMs).toUTCString();
    return `${sessionCookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeMs / 1000}; Expires=${expires}${secure}`;
}

function clearSessionCookie() {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${sessionCookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
}

export {
    clearSessionCookie,
    createSessionCookie,
    createStylistSession,
    destroyStylistSession,
    findStylistSession,
    isStylistEditorConfigured,
    sessionCookieName
};
