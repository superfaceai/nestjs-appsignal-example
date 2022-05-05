import { Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

import { AppsignalExceptionFilter } from './appsignal_exception.filter';

@Catch()
export class AllExceptionFilter extends AppsignalExceptionFilter<Error> {
  constructor() {
    super();
  }

  catch(error: Error, host: ArgumentsHost) {
    super.catch(error, host);

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const instance = req.path;

    const status = 500;

    const problem = {
      status,
      title: 'Internal server error',
      instance,
    };

    res.status(status).contentType('application/problem+json').json(problem);
  }
}
