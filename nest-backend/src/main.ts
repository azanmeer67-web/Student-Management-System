import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  
  // This tells Railway to use its own port, but uses 3001 on your laptop
  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();