import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import apiRoutes from './src/routes/api.js';

const app = express();
const port = process.env.PORT || 3000;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(currentDirectory, 'views'));
app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('X-Frame-Options', 'DENY');
    next();
});
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
    res.render('index');
});
app.use(express.static(path.join(currentDirectory, 'public')));

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || 500;
    if (status >= 500) console.error(err);
    const message = err.type === 'entity.parse.failed'
        ? 'Invalid JSON request body.'
        : status < 500
            ? err.message
            : 'Something went wrong. Please try again.';
    res.status(status).json({ error: message });
});

const server = app.listen(port, () => {
    console.log(`Dapper is running on port ${port}`);
});

export default server;
