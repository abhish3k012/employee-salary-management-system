const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/dashboard/summary - Overview stats
router.get('/summary', async (req, res) => {
  try {
    const totalEmployees = await prisma.employee.count();

    // Average salary grouped by currency
    const avgSalaryByCurrency = await prisma.employee.groupBy({
      by: ['currency'],
      _avg: { salary: true },
      _count: { _all: true }
    });

    // Total payroll grouped by currency (never mix currencies)
    const totalPayrollByCurrency = await prisma.employee.groupBy({
      by: ['currency'],
      _sum: { salary: true },
      _count: { _all: true }
    });

    res.json({
      totalEmployees,
      averageSalaryByCurrency: avgSalaryByCurrency.map(item => ({
        currency: item.currency,
        averageSalary: Math.round((item._avg.salary || 0) * 100) / 100,
        employeeCount: item._count._all
      })),
      totalPayrollByCurrency: totalPayrollByCurrency.map(item => ({
        currency: item.currency,
        totalPayroll: Math.round((item._sum.salary || 0) * 100) / 100,
        employeeCount: item._count._all
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: err.message });
  }
});

// GET /api/dashboard/by-department - Department-wise salary report
router.get('/by-department', async (req, res) => {
  try {
    const report = await prisma.employee.groupBy({
      by: ['department', 'currency'],
      _sum: { salary: true },
      _avg: { salary: true },
      _count: { _all: true },
      _min: { salary: true },
      _max: { salary: true },
      orderBy: { department: 'asc' }
    });

    res.json(report.map(item => ({
      department: item.department,
      currency: item.currency,
      employeeCount: item._count._all,
      totalSalary: Math.round((item._sum.salary || 0) * 100) / 100,
      averageSalary: Math.round((item._avg.salary || 0) * 100) / 100,
      minSalary: item._min.salary || 0,
      maxSalary: item._max.salary || 0
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch department report', error: err.message });
  }
});

// GET /api/dashboard/by-country - Country-wise salary report
router.get('/by-country', async (req, res) => {
  try {
    const report = await prisma.employee.groupBy({
      by: ['country', 'currency'],
      _sum: { salary: true },
      _avg: { salary: true },
      _count: { _all: true },
      _min: { salary: true },
      _max: { salary: true },
      orderBy: { country: 'asc' }
    });

    res.json(report.map(item => ({
      country: item.country,
      currency: item.currency,
      employeeCount: item._count._all,
      totalSalary: Math.round((item._sum.salary || 0) * 100) / 100,
      averageSalary: Math.round((item._avg.salary || 0) * 100) / 100,
      minSalary: item._min.salary || 0,
      maxSalary: item._max.salary || 0
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch country report', error: err.message });
  }
});

module.exports = router;
