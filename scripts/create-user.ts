import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { connectToDatabase } from '../server/db';
import { UserModel } from '../server/models/User';

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);

  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

function sha256Hex(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function printUsage() {
  console.error('Usage: npm run create:user -- --user "Admin" --email "admin@example.com" --password "your-secret"');
}

async function run() {
  const user = getArgValue('--user')?.trim();
  const email = getArgValue('--email')?.trim().toLowerCase();
  const password = getArgValue('--password');

  if (!user || !email || !password) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  await connectToDatabase();

  const hashedPassword = sha256Hex(password);

  await UserModel.findOneAndUpdate(
    { email },
    {
      user,
      email,
      hashedPassword,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`User created/updated for ${email}`);
}

run()
  .catch((error) => {
    console.error('Failed to create/update user:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
