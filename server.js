require('dotenv').config();
const express = require('express');
const prisma = require('./lib/prisma');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(express.json());

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

startServer();

module.exports = app;
