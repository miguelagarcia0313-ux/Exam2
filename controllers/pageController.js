import { isStylistEditorConfigured } from '../services/authService.js';

function renderHome(req, res) {
    res.render('index', { currentPage: 'home' });
}

function renderStylistProfile(req, res) {
    res.render('stylist-profile', { currentPage: 'profile' });
}

function renderStylistLogin(req, res) {
    if (req.stylistSession) return res.redirect(303, '/stylist/profile');

    const loginError = req.query.error === 'invalid'
        ? 'Sign-in failed. Check your password and try again.'
        : req.query.error === 'locked'
            ? 'Too many sign-in attempts. Try again in 15 minutes.'
            : '';
    res.set('Cache-Control', 'no-store');
    res.render('stylist-login', {
        currentPage: 'login',
        loginConfigured: isStylistEditorConfigured(),
        loginError
    });
}

function renderBecomeStylist(req, res) {
    res.render('become-a-stylist', { currentPage: 'become' });
}

export { renderBecomeStylist, renderHome, renderStylistLogin, renderStylistProfile };
