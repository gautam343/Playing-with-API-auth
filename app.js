require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./auth/routes');
const jwtAuth = require('./middleware/jwtAuth');
const employeesRouter = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connect
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  });

// Swagger
app.get('/swagger.json', (req, res) => {
  const swaggerPath = path.join(__dirname, 'swagger', 'swagger.json');
  res.sendFile(swaggerPath);
});
const swaggerDocument = require('./swagger/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// Health (public)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth (login) - public
app.use('/auth', express.json(), authRoutes);

// Employees - PROTECTED by JWT only
app.use('/employees', jwtAuth, employeesRouter);

// Root
app.get('/', (req, res) => {
  res.send(`Employee CRUD API (JWT Bearer only). Docs: <a href="/api-docs">/api-docs</a>`);
});

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
});
