import { Job } from 'bull';
import { appsignal } from '../appsignal';

import { ProcessMonitor } from './process_monitor.decorator';

jest.mock('../appsignal', () => ({
  appsignal: {
    tracer: jest.fn().mockReturnValue({
      createSpan: jest.fn().mockReturnValue({
        setName: jest.fn(),
        setCategory: jest.fn(),
        setSampleData: jest.fn(),
        close: jest.fn(),
        setError: jest.fn(),
      }),
      withSpan: jest.fn(async (span, callback) => {
        await callback(span);
      }),
    }),
  },
}));

describe('ProcessMonitor Decorator', () => {
  let processMock: jest.Mock;

  const buildJob = () => {
    return {
      id: 1,
    } as Job;
  };

  describe('when job handler succeeds', () => {
    beforeEach(async () => {
      jest.resetModules();
      jest.clearAllMocks();

      processMock = jest.fn();

      class TestProcessor {
        @ProcessMonitor()
        async doSomething(job: Job) {
          processMock(job);
        }
      }

      const testProcessor = new TestProcessor();

      await testProcessor.doSomething(buildJob());
    });

    it('should create appsignal tracer', () => {
      expect(appsignal.tracer).toBeCalled();
    });

    it('should create span', () => {
      expect(appsignal.tracer().createSpan).toBeCalledWith({
        namespace: 'worker',
      });
    });

    it('should set span name', () => {
      expect(appsignal.tracer().createSpan().setName).toBeCalledWith(
        'JOB TestProcessor.doSomething',
      );
    });

    it('should set span category', () => {
      expect(appsignal.tracer().createSpan().setCategory).toBeCalledWith(
        'job.handler',
      );
    });

    it('should set span sample data', () => {
      expect(appsignal.tracer().createSpan().setSampleData).toBeCalledWith(
        'custom_data',
        {
          jobId: 1,
        },
      );
    });

    it('should call tracer withSpan method', () => {
      expect(appsignal.tracer().withSpan).toBeCalled();
    });

    it('should call processMock', () => {
      expect(processMock).toBeCalled();
    });

    it('should close span', () => {
      expect(appsignal.tracer().createSpan().close).toBeCalled();
    });
  });

  describe('when job handler throws exception', () => {
    let testProcessor: ThrowingProcessor;

    class ThrowingProcessor {
      @ProcessMonitor()
      throwError() {
        throw new Error('Exception from job handler');
      }
    }
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();

      processMock = jest.fn();

      testProcessor = new ThrowingProcessor();
    });

    it('should add error to span', async () => {
      try {
        await testProcessor.throwError();
      } catch (error) {
        expect(appsignal.tracer().createSpan().setError).toBeCalledWith(error);
      }
    });

    it('should throw exception', async () => {
      await expect(() => testProcessor.throwError()).rejects.toThrowError();
    });
  });
});
