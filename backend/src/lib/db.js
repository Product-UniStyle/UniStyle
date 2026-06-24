import dns from 'dns';
import mongoose from 'mongoose';

// Node's bundled DNS resolver (c-ares) sometimes fails to read this
// machine's real DNS servers on Windows and falls back to 127.0.0.1,
// which breaks the SRV lookup mongodb+srv:// URIs depend on.
dns.setServers(['8.8.8.8', '4.2.2.2']);

export async function connectDb() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to MongoDB');
}
