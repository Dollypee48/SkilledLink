const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilledlink', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix KYC status for existing users
const fixKYCStatus = async () => {
  try {
    console.log('Starting KYC status migration...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to check`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix customers who should be auto-verified
      if (user.role === 'customer') {
        if (user.kycVerified !== true) {
          updates.kycVerified = true;
          needsUpdate = true;
        }
        if (user.kycStatus !== 'approved') {
          updates.kycStatus = 'approved';
          needsUpdate = true;
        }
      }
      
      // Fix artisans who have kycVerified but wrong status
      if (user.role === 'artisan' && user.kycVerified === true && user.kycStatus !== 'approved') {
        updates.kycStatus = 'approved';
        needsUpdate = true;
      }
      
      // Fix users who have approved status but kycVerified is false
      if (user.kycStatus === 'approved' && user.kycVerified !== true) {
        updates.kycVerified = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates);
        console.log(`Fixed user ${user.email} (${user.role}):`, updates);
        fixedCount++;
      }
    }
    
    console.log(`Migration completed. Fixed ${fixedCount} users.`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
const runMigration = async () => {
  await connectDB();
  await fixKYCStatus();
  process.exit(0);
};

runMigration();
