// functions/sendEmailViaSES.test.ts
import { mockClient } from 'aws-sdk-client-mock';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { main } from '../sendEmailViaSES';
import { SQSEvent } from 'aws-lambda';

const sesMock = mockClient(SESClient);

beforeEach(() => {
  sesMock.reset();
  process.env.SES_FROM_EMAIL = 'sender@test.com';
});

const makeSQSEvent = (detail: object): SQSEvent => ({
  Records: [
    {
      messageId: 'msg-1',
      body: JSON.stringify({ detail }),
      receiptHandle: '',
      attributes: {} as any,
      messageAttributes: {},
      md5OfBody: '',
      eventSource: 'aws:sqs',
      eventSourceARN: '',
      awsRegion: 'eu-central-1',
    },
  ],
});

describe('sendEmailViaSES', () => {
  it('should send email successfully', async () => {
    sesMock.on(SendEmailCommand).resolves({});

    await expect(
      main(
        makeSQSEvent({ to: 'to@test.com', subject: 'Hello', message: 'World' }),
      ),
    ).resolves.not.toThrow();
  });

  it('should skip record if required fields are missing', async () => {
    sesMock.on(SendEmailCommand).resolves({});

    await expect(
      main(makeSQSEvent({ to: 'to@test.com' })), // missing subject and message
    ).resolves.not.toThrow();

    expect(sesMock.calls()).toHaveLength(0); // SES should not be called
  });

  it('should throw if SES fails', async () => {
    sesMock.on(SendEmailCommand).rejects(new Error('SES error'));

    await expect(
      main(
        makeSQSEvent({ to: 'to@test.com', subject: 'Hello', message: 'World' }),
      ),
    ).rejects.toThrow('SES error');
  });
});
