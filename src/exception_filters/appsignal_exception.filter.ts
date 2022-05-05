import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

import { appsignal } from '../appsignal';

@Catch()
export class AppsignalExceptionFilter<T extends Error>
  implements ExceptionFilter
{
  catch(error: T, _host: ArgumentsHost) {
    let status: number;
    const tracer = appsignal.tracer();

    if (!tracer) {
      return;
    }

    if (error instanceof HttpException) {
      status = error.getStatus();
    }

    if (error && (!status || (status && status >= 500))) {
      tracer.setError(error);
    }
  }
}
