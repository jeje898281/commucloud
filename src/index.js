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
const cors = require('cors');
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const apiSpec = loadSwaggerSpec();

const app = express();
app.use(express.json());


app.use(cors({
    origin: (origin, callback) => {
        // 沒有 origin 表示 Postman / curl 之類，允許
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 預檢快取一天
}));


app.use('/api/auth', authRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', profileRoutes);
app.use('/api', communityRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
