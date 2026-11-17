import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import pageRoutes from './routes/pages.js';
import { loadStylistSession } from './middleware/authentication.js';
import { securityMiddleware } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 4000;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(currentDirectory, 'views'));
app.use(securityMiddleware);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(loadStylistSession);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use(pageRoutes);
app.use(express.static(path.join(currentDirectory, 'public')));
app.use(errorHandler);

const server = app.listen(port, () => {
    console.log(`Dapper is running on port ${port}`);
});

export default server;
