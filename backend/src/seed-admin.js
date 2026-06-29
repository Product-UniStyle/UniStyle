import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from './lib/db.js';
import User from './models/User.js';

await connectDb();

const email = process.env.SEED_ADMIN_EMAIL || 'admin@unistyle.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

const existing = await User.findOne({ email });
if (existing) {
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
    console.log(`Updated existing user to admin: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
await User.create({ email, passwordHash, role: 'admin', firstName: 'Admin' });

console.log('');
console.log('Admin user created:');
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log('');
console.log('Change the password after first login.');
process.exit(0);
