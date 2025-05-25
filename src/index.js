require('dotenv').config();               // 請先 pnpm install dotenv
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const swaggerUi = require('swagger-ui-express');
const loadSwaggerSpec = require('./utils/loadSwaggerSpec');

const app = express();
app.use(express.json());

const apiSpec = loadSwaggerSpec();

app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/meeting', meetingRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
