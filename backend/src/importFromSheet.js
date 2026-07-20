import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
import { connectDb } from './lib/db.js';
import { parseProductsFromCsv } from './lib/sheetImport.js';
import Product from './models/Product.js';

// Imports products from the data team's CSV export into MongoDB.
// Usage:
//   node src/importFromSheet.js "<path-to-csv>"            (dry run - just reports, writes nothing)
//   node src/importFromSheet.js "<path-to-csv>" --write    (actually upserts into the database)

async function main() {
  const filePath = process.argv[2];
  const shouldWrite = process.argv.includes('--write');

  if (!filePath) {
    console.error('Usage: node src/importFromSheet.js "<path-to-csv>" [--write]');
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const { products, warnings, totalRows } = parseProductsFromCsv(text);

  console.log(`Parsed ${totalRows} rows -> ${products.length} valid products, ${totalRows - products.length} skipped.\n`);

  if (warnings.length) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log('  - ' + w));
    console.log('');
  }

  console.log('Products to import:');
  products.forEach((p) => {
    console.log(`  - [${p.slug}] ${p.name} | ${p.category} | AED ${p.price / 100} | colors: ${(p.colors ?? []).length} | sizes: ${p.sizes.length} | images: ${(p.images ?? []).length}`);
  });

  if (!shouldWrite) {
    console.log('\nDry run only - nothing was written. Re-run with --write to import into the database.');
    return;
  }

  await connectDb();
  console.log('\nConnected to MongoDB. Importing...');
  for (const product of products) {
    await Product.findOneAndUpdate(
      { slug: product.slug },
      { $set: product },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Imported ${products.length} products.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
