import { expressMiddleware as appsignalExpressMiddleware } from '@appsignal/express';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AllExceptionFilter } from './exception_filters/all_exception.filter';
import { AppModule } from './app.module';
import { appsignal } from './appsignal';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(appsignalExpressMiddleware(appsignal));
  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(3000);
}
bootstrap();
