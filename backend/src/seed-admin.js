import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from './lib/db.js';
import StaffUser from './models/StaffUser.js';

await connectDb();

const email = process.env.SEED_ADMIN_EMAIL || 'admin@unistyle.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

const existing = await StaffUser.findOne({ email });
if (existing) {
  console.log(`Admin already exists: ${email}`);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
await StaffUser.create({ email, passwordHash, role: 'admin', firstName: 'Admin' });

console.log('');
console.log('Admin user created:');
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log('');
console.log('Change the password after first login.');
process.exit(0);
