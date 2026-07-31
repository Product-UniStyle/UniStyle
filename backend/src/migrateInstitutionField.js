import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './lib/db.js';

// One-off migration: renames Product.university -> Product.institution and
// backfills institutionType: 'university' on existing documents that predate
// the school/university distinction.
// Usage:
//   node src/migrateInstitutionField.js            (dry run - reports counts only)
//   node src/migrateInstitutionField.js --write     (actually applies the migration)

async function main() {
  const shouldWrite = process.argv.includes('--write');

  await connectDb();
  const collection = mongoose.connection.collection('products');

  const toRename = await collection.countDocuments({ university: { $exists: true } });
  const toBackfillType = await collection.countDocuments({ institutionType: { $exists: false } });

  console.log(`Found ${toRename} product(s) with a "university" field to rename to "institution".`);
  console.log(`Found ${toBackfillType} product(s) missing "institutionType" to backfill as "university".`);

  if (!shouldWrite) {
    console.log('\nDry run only - nothing was written. Re-run with --write to apply.');
    await mongoose.disconnect();
    return;
  }

  const renameResult = await collection.updateMany(
    { university: { $exists: true } },
    { $rename: { university: 'institution' } }
  );
  console.log(`Renamed university -> institution on ${renameResult.modifiedCount} document(s).`);

  const backfillResult = await collection.updateMany(
    { institutionType: { $exists: false } },
    { $set: { institutionType: 'university' } }
  );
  console.log(`Backfilled institutionType on ${backfillResult.modifiedCount} document(s).`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
