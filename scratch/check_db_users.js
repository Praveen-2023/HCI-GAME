const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/src/models/user.model');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected.');

    const users = await User.find({});
    console.log(`Total users in DB: ${users.length}`);
    for (const u of users) {
      console.log(`User: ${u.email}, Type: ${u.type}, Level: ${u.level}, TotalScore: ${u.totalScore}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
