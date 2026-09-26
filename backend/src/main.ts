import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // the Next.js frontend is a different origin; without this the browser blocks every call
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
