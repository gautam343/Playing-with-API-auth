// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const basicAuth = require('./middleware/basicAuth');
const employeesRouter = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employeesdb';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message || err);
  process.exit(1);
});

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  const swaggerPath = path.join(__dirname, 'swagger', 'swagger.json');
  res.sendFile(swaggerPath);
});

// Swagger UI
const swaggerDocument = require('./swagger/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// Health (no auth)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Protected API
app.use('/employees', basicAuth, employeesRouter);

// Root
app.get('/', (req, res) => {
  res.send(`Employee CRUD API (MongoDB). Swagger UI: <a href='/api-docs'>/api-docs</a>`);
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
