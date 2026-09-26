import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // the Next.js frontend is a different origin; without this the browser blocks every call
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      // drop any property the DTO doesn't declare, so a crafted body can't
      // pass fields straight through to the entity
      whitelist: true,
      // apply @Type() so numeric fields arrive as numbers rather than strings
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
