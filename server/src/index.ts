import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config';

async function main(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  createApp().listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

main().catch((error: unknown) => {
  console.error('Could not start the server:', error instanceof Error ? error.message : error);
  process.exit(1);
});
