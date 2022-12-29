import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  await app.listen(4000);
}
bootstrap();

/* TO DO:
- Body validation
- Security
- Middleware banned check
- Enum role
- Error handling
- Logging
- Testing
- Deployment
- Documentation
*/
