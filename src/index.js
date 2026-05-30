// src/index.js
const buildApp = require('./app');

const app = buildApp();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
