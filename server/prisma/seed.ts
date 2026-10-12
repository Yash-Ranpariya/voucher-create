import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password@123', salt);

  const users = [
    {
      name: 'Employee One',
      email: 'employee1@abc.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      employee_code: 'EMP001',
      department: 'Engineering'
    },
    {
      name: 'Employee Two',
      email: 'employee2@abc.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      employee_code: 'EMP002',
      department: 'Marketing'
    },
    {
      name: 'Director',
      email: 'director@abc.com',
      password_hash: passwordHash,
      role: 'DIRECTOR',
      department: 'Management'
    },
    {
      name: 'Accounts',
      email: 'accounts@abc.com',
      password_hash: passwordHash,
      role: 'ACCOUNTS',
      department: 'Finance'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
