import { Injectable, OnApplicationShutdown } from '@nestjs/common';

import { appsignal } from './appsignal';

@Injectable()
export class AppsignalShutdownService implements OnApplicationShutdown {
  onApplicationShutdown(_signal: string) {
    appsignal.stop();
  }
}
