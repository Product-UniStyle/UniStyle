import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './lib/db.js';

// One-off migration: lets a user wishlist each color of a product independently
// instead of one wishlist row covering the whole product. Drops the old
// { userId, productId } unique index (which only allowed one wishlist row per
// product at all) and replaces it with { userId, productId, color } unique.
// Existing rows are left with color: null, meaning "the product in general" —
// unchanged behavior for anything wishlisted before this migration.
// Usage:
//   node src/migrateWishlistColor.js            (dry run - reports only)
//   node src/migrateWishlistColor.js --write     (actually applies the migration)

const OLD_INDEX_NAME = 'userId_1_productId_1';
const NEW_INDEX_SPEC = { userId: 1, productId: 1, color: 1 };

async function main() {
  const shouldWrite = process.argv.includes('--write');

  await connectDb();
  const collection = mongoose.connection.collection('wishlistitems');

  const existingIndexes = await collection.indexes();
  const hasOldIndex = existingIndexes.some((idx) => idx.name === OLD_INDEX_NAME);
  const toBackfill = await collection.countDocuments({ color: { $exists: false } });

  console.log(hasOldIndex
    ? `Found old unique index "${OLD_INDEX_NAME}" to drop.`
    : `Old index "${OLD_INDEX_NAME}" not present (already migrated?).`);
  console.log(`Found ${toBackfill} wishlist row(s) missing "color" to backfill as null.`);

  if (!shouldWrite) {
    console.log('\nDry run only - nothing was written. Re-run with --write to apply.');
    await mongoose.disconnect();
    return;
  }

  if (hasOldIndex) {
    await collection.dropIndex(OLD_INDEX_NAME);
    console.log(`Dropped index "${OLD_INDEX_NAME}".`);
  }

  const backfillResult = await collection.updateMany(
    { color: { $exists: false } },
    { $set: { color: null } }
  );
  console.log(`Backfilled color on ${backfillResult.modifiedCount} document(s).`);

  await collection.createIndex(NEW_INDEX_SPEC, { unique: true });
  console.log('Created new unique index on { userId, productId, color }.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
