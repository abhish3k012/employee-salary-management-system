require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const prisma = require('./lib/prisma');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend build if present
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));

app.get('/api', (req, res) => {
  res.json({
    name: 'Employee Salary Management System',
    status: 'online',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL Database Connected Successfully via Prisma');
    app.listen(PORT, () => console.log(`Employee Salary Management System running on port ${PORT}`));
  } catch (error) {
    console.error('Database connection error on startup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
