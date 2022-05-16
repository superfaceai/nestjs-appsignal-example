import { HttpException } from '@nestjs/common';
import { appsignal } from '../appsignal';

import { AppsignalExceptionFilter } from './appsignal_exception.filter';

jest.mock('../appsignal', () => ({
  appsignal: {
    tracer: jest.fn().mockReturnValue({
      setError: jest.fn(),
    }),
  },
}));

describe('AppsignalExceptionFilter', () => {
  let baseExceptionFilter: AppsignalExceptionFilter<Error>;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    baseExceptionFilter = new AppsignalExceptionFilter();
  });

  describe('#catch', () => {
    it('should call tracer', () => {
      baseExceptionFilter.catch(new Error(), null);

      expect(appsignal.tracer).toBeCalled();
    });

    it('should add error', () => {
      const error = new Error();
      baseExceptionFilter.catch(error, null);

      expect(appsignal.tracer().setError).toBeCalledWith(error);
    });

    describe('with HttpException', () => {
      it('should add error for 500 status code', () => {
        const error = new HttpException('Internal server error', 500);
        baseExceptionFilter.catch(error, null);

        expect(appsignal.tracer().setError).toBeCalledWith(error);
      });

      it('should not add error for 400 status code', () => {
        const error = new HttpException('Bad request', 400);
        baseExceptionFilter.catch(error, null);

        expect(appsignal.tracer().setError).not.toBeCalled();
      });
    });
  });
});
