const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  try {
    await connectDB();

    const users = await User.find({}, 'name nameKey');
    let updated = 0;

    for (const user of users) {
      const nextNameKey = String(user.name || '').trim().toLowerCase();
      if (!nextNameKey) {
        continue;
      }

      if (user.nameKey !== nextNameKey) {
        user.nameKey = nextNameKey;
        await user.save();
        updated += 1;
      }
    }

    console.log(`Backfilled nameKey for ${updated} users`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to backfill name keys:', error.message);
    process.exit(1);
  }
};

run();
