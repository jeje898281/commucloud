require('dotenv').config();               // 請先 pnpm install dotenv
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const communityRoutes = require('./routes/communityRoutes');
const swaggerUi = require('swagger-ui-express');
const loadSwaggerSpec = require('./utils/loadSwaggerSpec');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const apiSpec = loadSwaggerSpec();

const app = express();
app.use(express.json());


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

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes); // login api is not required to be authenticated

const apiRouter = express.Router();
apiRouter.use('/resident', residentRoutes);
apiRouter.use('/meeting', meetingRoutes);
apiRouter.use(notificationRoutes);
apiRouter.use(profileRoutes);
apiRouter.use(communityRoutes);

app.use('/api', authMiddleware, apiRouter);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
