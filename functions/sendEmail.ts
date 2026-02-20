import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

const client = new EventBridgeClient({});

export async function main(event: { body: string | null }) {
  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Email request received:', body);

    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: to, subject, message',
        }),
      };
    }

    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: process.env.EVENT_BUS_NAME,
            Source: 'email-service',
            DetailType: 'NewEmail',
            Detail: JSON.stringify(body),
          },
        ],
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email queued successfully!' }),
    };
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('Invalid JSON in request body:', err);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    console.error('Failed to publish event to EventBridge:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error, please try again later',
      }),
    };
  }
}
