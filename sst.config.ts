import { SSTConfig } from 'sst';
import { MyStack } from './stacks/MyStack';

export default {
  config(_input) {
    return {
      name: 'email-next-sst',
      region: process.env.AWS_REGION || 'eu-central-1',
    };
  },
  stacks(app) {
    app.stack(MyStack);
  },
} as SSTConfig;
