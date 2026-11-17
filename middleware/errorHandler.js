function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
        ? err.status
        : 500;
    if (status >= 500) console.error(err);
    const message = err.type === 'entity.parse.failed'
        ? 'Invalid request body.'
        : status < 500
            ? err.message
            : 'Something went wrong. Please try again.';

    const isApiRequest = req.originalUrl === '/api' || req.originalUrl.startsWith('/api/');
    if (!isApiRequest && req.accepts('html')) {
        return res.status(status).render('error', {
            currentPage: 'error',
            status,
            message
        });
    }
    res.status(status).json({ error: message });
}

export { errorHandler };
