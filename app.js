require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./auth/routes');
const combinedAuth = require('./auth/combinedAuth');
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
    console.log('Mongo URI:', MONGO_URI);
    console.log('Using database name:', mongoose.connection.name);
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

// Health route (public)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth routes (login)
app.use('/auth', express.json(), authRoutes);

// Employee CRUD — protected (accepts Bearer or Basic)
app.use('/employees', combinedAuth, employeesRouter);

// Default route
app.get('/', (req, res) => {
  res.send(`✅ Employee CRUD API running.<br>Docs: <a href="/api-docs">Swagger UI</a>`);
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
});
