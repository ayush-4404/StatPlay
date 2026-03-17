const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Change this to the email of the user you want to make admin
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('❌ Please provide a user email as an argument');
      console.log('Usage: node makeAdmin.js user@example.com');
      process.exit(1);
    }
    
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { isAdmin: true } },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ User ${user.email} (${user.name}) is now an admin`);
      console.log('👤 Username:', user.username);
    } else {
      console.log(`❌ User with email "${userEmail}" not found`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();
