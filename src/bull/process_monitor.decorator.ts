import { appsignal } from '../appsignal';

export function ProcessMonitor(): MethodDecorator {
  return function (
    target,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any) {
      const tracer = appsignal.tracer();

      const span = tracer.createSpan({
        namespace: 'worker',
      });
      span.setName(`JOB ${this.constructor.name}.${propertyKey}`);
      span.setCategory('job.handler');

      const job = args[0];

      if (job) {
        span.setSampleData('custom_data', { jobId: job.id });
      }

      let result;
      await tracer.withSpan(span, async (span) => {
        try {
          result = await method.bind(this).apply(target, args);
        } catch (error) {
          span.setError(error);
          throw error;
        } finally {
          span.close();
        }
      });

      return result;
    };
  };
}
