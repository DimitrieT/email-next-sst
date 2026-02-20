import { mockClient } from 'aws-sdk-client-mock';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { main } from '../sendEmail';

const eventBridgeMock = mockClient(EventBridgeClient);

beforeEach(() => {
  eventBridgeMock.reset();
  process.env.EVENT_BUS_NAME = 'test-bus';
});

describe('sendEmail', () => {
  it('should return 400 if body is missing required fields', async () => {
    const result = await main({
      body: JSON.stringify({ to: 'test@test.com' }),
    });
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe(
      'Missing required fields: to, subject, message',
    );
  });

  it('should return 400 if body is invalid JSON', async () => {
    const result = await main({ body: 'invalid json' });
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Invalid JSON in request body');
  });

  it('should publish to EventBridge and return 200', async () => {
    eventBridgeMock.on(PutEventsCommand).resolves({});

    const result = await main({
      body: JSON.stringify({
        to: 'test@test.com',
        subject: 'Hello',
        message: 'World',
      }),
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Email queued successfully!');
  });

  it('should return 500 if EventBridge throws', async () => {
    eventBridgeMock
      .on(PutEventsCommand)
      .rejects(new Error('EventBridge error'));

    const result = await main({
      body: JSON.stringify({
        to: 'test@test.com',
        subject: 'Hello',
        message: 'World',
      }),
    });

    expect(result.statusCode).toBe(500);
  });
});
