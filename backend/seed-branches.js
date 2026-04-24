import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from './models/Branch.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fic-crm';

async function seedBranches() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const branches = [
      { name: 'Thirupathur' },
      { name: 'Krishnagiri' },
      { name: 'Bangalore' },
      { name: 'Chennai' }
    ];

    for (const b of branches) {
      const existing = await Branch.findOne({ name: b.name });
      if (!existing) {
        await Branch.create(b);
        console.log(`Created branch: ${b.name}`);
      } else {
        console.log(`Branch already exists: ${b.name}`);
      }
    }

    console.log('Branch seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Branch seeding failed:', err);
    process.exit(1);
  }
}

seedBranches();
