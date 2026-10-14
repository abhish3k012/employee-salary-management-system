const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/employees - List with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { search, department, country, sortBy, sortOrder } = req.query;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (department) {
      where.department = department;
    }

    if (country) {
      where.country = country;
    }

    // Build orderBy
    const allowedSortFields = ['firstName', 'lastName', 'employeeId', 'department', 'country', 'salary', 'dateOfJoining', 'createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: orderDir }
      }),
      prisma.employee.count({ where })
    ]);

    res.json({
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Employee list error:', err.message);
    res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
  }
});

// GET /api/employees/filters - Get distinct departments and countries for filters
router.get('/filters', async (req, res) => {
  try {
    const [departments, countries] = await Promise.all([
      prisma.employee.findMany({ select: { department: true }, distinct: ['department'], orderBy: { department: 'asc' } }),
      prisma.employee.findMany({ select: { country: true }, distinct: ['country'], orderBy: { country: 'asc' } })
    ]);

    res.json({
      departments: departments.map(d => d.department),
      countries: countries.map(c => c.country)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch filters', error: err.message });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
  }
});

// POST /api/employees - Create employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, phone, department, designation, country, city, salary, currency, dateOfJoining } = req.body;

    // Validation
    const errors = [];
    if (!employeeId) errors.push('Employee ID is required');
    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!email) errors.push('Email is required');
    if (!department) errors.push('Department is required');
    if (!designation) errors.push('Designation is required');
    if (!country) errors.push('Country is required');
    if (salary === undefined || salary === null || salary < 0) errors.push('Valid salary is required');
    if (!currency) errors.push('Currency is required');
    if (!dateOfJoining) errors.push('Date of joining is required');

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check for duplicate employeeId or email
    const existing = await prisma.employee.findFirst({
      where: { OR: [{ employeeId }, { email }] }
    });

    if (existing) {
      const field = existing.employeeId === employeeId ? 'Employee ID' : 'Email';
      return res.status(409).json({ message: `${field} already exists` });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        department,
        designation,
        country,
        city: city || null,
        salary: parseFloat(salary),
        currency,
        dateOfJoining: new Date(dateOfJoining)
      }
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error('Employee creation error:', err.message);
    res.status(500).json({ message: 'Failed to create employee', error: err.message });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.employee.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { firstName, lastName, email, phone, department, designation, country, city, salary, currency, dateOfJoining } = req.body;

    // Validation for provided fields
    const errors = [];
    if (firstName !== undefined && !firstName) errors.push('First name cannot be empty');
    if (lastName !== undefined && !lastName) errors.push('Last name cannot be empty');
    if (email !== undefined && !email) errors.push('Email cannot be empty');
    if (salary !== undefined && (salary === null || salary < 0)) errors.push('Valid salary is required');
    if (currency !== undefined && !currency) errors.push('Currency cannot be empty');

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check email uniqueness if changing email
    if (email && email !== existing.email) {
      const emailTaken = await prisma.employee.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone || null;
    if (department !== undefined) data.department = department;
    if (designation !== undefined) data.designation = designation;
    if (country !== undefined) data.country = country;
    if (city !== undefined) data.city = city || null;
    if (salary !== undefined) data.salary = parseFloat(salary);
    if (currency !== undefined) data.currency = currency;
    if (dateOfJoining !== undefined) data.dateOfJoining = new Date(dateOfJoining);

    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data
    });

    res.json(employee);
  } catch (err) {
    console.error('Employee update error:', err.message);
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.employee.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await prisma.employee.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete employee', error: err.message });
  }
});

module.exports = router;
