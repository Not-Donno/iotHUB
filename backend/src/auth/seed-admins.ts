import { NestFactory } from '@nestjs/core';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module.js';
import { User, UserRole } from '../users/entities/user.entity.js';


const ADMIN_EMAILS = ['chachaji@gmail.com', 'donno@gmail.com'] as const;

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Admins@123';

async function seed() {
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const users = app.get(DataSource).getRepository(User);

    for (const email of ADMIN_EMAILS) {
      const existing = await users.findOneBy({ email });

      if (existing) {
        if (existing.role !== UserRole.ADMIN) {
          await users.update({ id: existing.id }, { role: UserRole.ADMIN });
          console.log(`~ ${email}: existing account promoted to admin`);
        } else {
          console.log(`= ${email}: already an admin, left untouched`);
        }
        continue;
      }

      await users.save(
        users.create({
          email,
          password_hash: await hash(password, SALT_ROUNDS),
          role: UserRole.ADMIN,
          is_active: true,
        }),
      );
      console.log(`+ ${email}: admin created`);
    }

    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log(`\nseeded password: ${DEFAULT_PASSWORD} (dev only - change it)`);
    }
  } finally {
    await app.close();
  }
}

await seed();
