import mongoose from 'mongoose';
import { connectToDatabase } from '../server/db';
import { UserModel } from '../server/models/User';
import { hashPassword } from '../server/http-utils';

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);

  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

function printUsage() {
  console.error('Usage: CREATE_USER_PASSWORD="your-secret" npm run create:user -- --user "Admin" --email "admin@example.com"');
  console.error('       (--password "your-secret" also works but leaves the password in shell history and the process list)');
}

async function run() {
  const user = getArgValue('--user')?.trim();
  const email = getArgValue('--email')?.trim().toLowerCase();
  const password = process.env.CREATE_USER_PASSWORD || getArgValue('--password');

  if (!user || !email || !password) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (password.length < 12) {
    console.error('Password must be at least 12 characters long.');
    process.exitCode = 1;
    return;
  }

  await connectToDatabase();

  const hashedPassword = hashPassword(password);

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
