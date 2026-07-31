import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './lib/db.js';

// One-off backfill: sets isAccessory: true on existing products whose category
// matches the old hardcoded accessory-category list (previously baked into
// ShopPage.tsx/Header.tsx), so the live "Accessories" grouping doesn't go empty
// the moment the new isAccessory-driven code ships. Going forward, isAccessory
// is set per-product via the CSV `accessories` column or the admin panel checkbox.
// Usage:
//   node src/backfillAccessoryFlag.js            (dry run - reports counts only)
//   node src/backfillAccessoryFlag.js --write     (actually applies the backfill)

const OLD_ACCESSORY_CATEGORIES = ['Badges', 'Bagpack', 'Beanies', 'Bottles', 'Crests', 'Mugs', 'Scarfs', 'Tote Bags'];

async function main() {
  const shouldWrite = process.argv.includes('--write');

  await connectDb();
  const collection = mongoose.connection.collection('products');

  const filter = { category: { $in: OLD_ACCESSORY_CATEGORIES }, isAccessory: { $ne: true } };
  const toBackfill = await collection.countDocuments(filter);
  console.log(`Found ${toBackfill} product(s) in a known accessory category not yet flagged isAccessory: true.`);

  if (!shouldWrite) {
    console.log('\nDry run only - nothing was written. Re-run with --write to apply.');
    await mongoose.disconnect();
    return;
  }

  const result = await collection.updateMany(filter, { $set: { isAccessory: true } });
  console.log(`Backfilled isAccessory: true on ${result.modifiedCount} document(s).`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
