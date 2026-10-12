import app from './app';
import { env } from './config/env';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
