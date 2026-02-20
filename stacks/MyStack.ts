import { StackContext, Api, Queue, EventBus, StaticSite } from 'sst/constructs';

export function MyStack({ stack }: StackContext) {
  const bus = new EventBus(stack, 'EmailBus');

  // SQS Queue — consumer Lambda pulls messages and sends via SES
  const emailQueue = new Queue(stack, 'EmailQueue', {
    consumer: {
      function: {
        handler: 'functions/sendEmailViaSES.main',
        environment: {
          SES_FROM_EMAIL: 'tomuleseidimitrie@gmail.com', // must be verified in SES
        },
      },
    },
  });

  emailQueue.attachPermissions(['ses:SendEmail']);

  // API Gateway + Lambda (User → API Gateway → Lambda → EventBridge)
  const api = new Api(stack, 'Api', {
    routes: {
      'POST /send-email': {
        function: {
          handler: 'functions/sendEmail.main',
          environment: {
            EVENT_BUS_NAME: bus.eventBusName,
          },
        },
      },
    },
  });

  // Allow API Lambda to publish to EventBridge
  api.getFunction('POST /send-email')?.attachPermissions([bus]);

  // EventBridge → SQS (Lambda consumer then sends via SES)
  bus.addRules(stack, {
    EmailRule: {
      pattern: {
        source: ['email-service'],
        detailType: ['NewEmail'],
      },
      targets: {
        emailQueue: {
          type: 'queue',
          queue: emailQueue,
        },
      },
    },
  });

  // Frontend
  const site = new StaticSite(stack, 'WebSite', {
    path: 'web',
    buildCommand: 'npm run build',
    buildOutput: 'out',
    environment: {
      NEXT_PUBLIC_API_URL: api.url,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteUrl: site.url,
    EmailQueueUrl: emailQueue.queueUrl,
    EventBusName: bus.eventBusName,
  });
}
