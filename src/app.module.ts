import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppsignalShutdownService } from './appsignal_shutdown.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppsignalShutdownService],
})
export class AppModule {}
