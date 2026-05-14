import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

async function runSeed(dataSource: DataSource) {
  try {
    const existing = await dataSource.query(
      "SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1"
    );
    if (existing.length === 0) {
      const adminPass = await bcrypt.hash('demo1234', 12);
      const managerPass = await bcrypt.hash('demo1234', 12);
      await dataSource.query(`
        INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
        VALUES 
          (gen_random_uuid(), 'admin@demo.com', 'Admin Kullanici', '${adminPass}', 'admin', true, now(), now()),
          (gen_random_uuid(), 'manager@demo.com', 'Proje Yoneticisi', '${managerPass}', 'manager', true, now(), now())
      `);
      console.log('Seed: users created');
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  
  const dataSource = app.get(DataSource);
  await runSeed(dataSource);
  
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
  console.log('Backend running on http://localhost:4000/api');
}
bootstrap();