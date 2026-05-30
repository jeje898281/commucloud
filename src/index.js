// src/index.js
require('dotenv').config();               // 請先 npm install dotenv
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(express.json());

// 全域 Route
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/report', reportRoutes);

// 健康檢查
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
