import { SQSEvent } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({});

export async function main(event: SQSEvent) {
  for (const record of event.Records) {
    try {
      // SQS message body is the EventBridge event wrapper
      const eventBridgeEvent = JSON.parse(record.body);
      const { to, subject, message } = eventBridgeEvent.detail;

      if (!to || !subject || !message) {
        console.error('Missing required fields in message:', record.body);
        continue; // skip malformed messages, don't block the batch
      }

      await client.send(
        new SendEmailCommand({
          Source: process.env.SES_FROM_EMAIL,
          Destination: {
            ToAddresses: [to],
          },
          Message: {
            Subject: {
              Data: subject,
            },
            Body: {
              Text: {
                Data: message,
              },
            },
          },
        }),
      );

      console.log(`Email sent successfully to ${to}`);
    } catch (err) {
      console.error('Failed to process SQS record:', record.messageId, err);
      // re-throw so SQS knows this record failed and can retry/DLQ it
      throw err;
    }
  }
}
