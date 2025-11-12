require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const oauthRoutes = require('./auth/oauthRoutes');
const { authenticate: oauthAuthenticate } = oauthRoutes;
const employeesRouter = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  });

// Swagger serve
app.get('/swagger.json', (req, res) => {
  const swaggerPath = path.join(__dirname, 'swagger', 'swagger.json');
  res.sendFile(swaggerPath);
});
const swaggerDocument = require('./swagger/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// Health (public)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// OAuth token endpoint (x-www-form-urlencoded)
app.use('/oauth', express.urlencoded({ extended: true }), oauthRoutes.router);

// Protect /employees with OAuth2 token
app.use('/employees', oauthAuthenticate, employeesRouter);

// Root
app.get('/', (req, res) => {
  res.send(`Employee CRUD API (OAuth2). Docs: <a href="/api-docs">/api-docs</a><br/>Token endpoint: POST /oauth/token`);
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
});
