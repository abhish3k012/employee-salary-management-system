const prisma = require('../lib/prisma');

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Product', 'Design', 'Legal', 'Customer Support'];
const DESIGNATIONS = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director', 'VP'];

const COUNTRIES = [
  { name: 'United States', currency: 'USD', cities: ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle'] },
  { name: 'United Kingdom', currency: 'GBP', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Edinburgh'] },
  { name: 'India', currency: 'INR', cities: ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune'] },
  { name: 'Germany', currency: 'EUR', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Stuttgart'] },
  { name: 'Canada', currency: 'CAD', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { name: 'Australia', currency: 'AUD', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { name: 'Japan', currency: 'JPY', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo'] },
  { name: 'Singapore', currency: 'SGD', cities: ['Singapore'] }
];

// Salary ranges by currency (annual)
const SALARY_RANGES = {
  USD: { min: 45000, max: 180000 },
  GBP: { min: 30000, max: 140000 },
  INR: { min: 400000, max: 4000000 },
  EUR: { min: 35000, max: 150000 },
  CAD: { min: 50000, max: 170000 },
  AUD: { min: 55000, max: 175000 },
  JPY: { min: 3500000, max: 15000000 },
  SGD: { min: 45000, max: 180000 }
};

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Amit', 'Priya', 'Raj', 'Sunita', 'Vikram', 'Anita', 'Kenji', 'Yuki', 'Hans', 'Anna', 'Pierre', 'Marie', 'Wei', 'Mei', 'Carlos', 'Sofia', 'Ahmed', 'Fatima', 'Liam', 'Emma'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Kumar', 'Sharma', 'Singh', 'Patel', 'Tanaka', 'Yamamoto', 'Mueller', 'Schmidt', 'Dubois', 'Chen', 'Wang', 'Kim', 'Park', 'Johansson', 'Nielsen', 'Costa', 'Silva', 'Ali', 'Hassan', 'OBrien'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmployee(index) {
  const countryData = randomElement(COUNTRIES);
  const salaryRange = SALARY_RANGES[countryData.currency];

  return {
    employeeId: `EMP${String(index + 1).padStart(5, '0')}`,
    firstName: randomElement(FIRST_NAMES),
    lastName: randomElement(LAST_NAMES),
    email: `employee${index + 1}@company.com`,
    phone: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
    department: randomElement(DEPARTMENTS),
    designation: randomElement(DESIGNATIONS),
    country: countryData.name,
    city: randomElement(countryData.cities),
    salary: randomBetween(salaryRange.min, salaryRange.max),
    currency: countryData.currency,
    dateOfJoining: randomDate(2015, 2025)
  };
}

async function seed() {
  console.log('Seeding 10,000 employees...');
  const startTime = Date.now();

  // Clear existing employees
  await prisma.employee.deleteMany();
  console.log('Cleared existing employees');

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  const TOTAL = 10000;

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL); j++) {
      batch.push(generateEmployee(j));
    }

    await prisma.employee.createMany({ data: batch });
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, TOTAL)} / ${TOTAL}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Seeding complete! ${TOTAL} employees created in ${elapsed}s`);
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
