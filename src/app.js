// src/app.js
// Configures the Express app without starting a listener — importable from tests.
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const communityRoutes = require('./routes/communityRoutes');
const swaggerUi = require('swagger-ui-express');
const loadSwaggerSpec = require('./utils/loadSwaggerSpec');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter } = require('./middleware/rateLimiters');

function buildApp() {
    const app = express();
    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(express.json({ limit: '1mb' }));

    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 204,
        maxAge: 86400
    }));

    const apiSpec = loadSwaggerSpec();
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
    app.get('/api/health', (_req, res) => res.json({ ok: true }));
    app.use('/api/auth', authLimiter, authRoutes);

    const apiRouter = express.Router();
    apiRouter.use('/resident', residentRoutes);
    apiRouter.use('/meeting', meetingRoutes);
    apiRouter.use('/admin', adminUserRoutes);
    apiRouter.use(notificationRoutes);
    apiRouter.use(profileRoutes);
    apiRouter.use(communityRoutes);

    app.use('/api', authMiddleware, apiRouter);
    app.use(errorHandler);
    return app;
}

module.exports = buildApp;
