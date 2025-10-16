const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // MongoDB connection options for production optimization
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      retryWrites: true, // Retry failed writes
      retryReads: true, // Retry failed reads
      appName: process.env.MONGODB_APPNAME || 'SkilledLinkBackend',
    };

    // Add TLS options for production (modern drivers use `tls` not `ssl`)
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      options.tls = true;
      // Validation is enabled by default; avoid deprecated/unsupported `sslValidate`
    }

    // Optional direct connection mode to bypass SRV when having DNS issues
    if (process.env.MONGODB_DIRECT === 'true') {
      options.directConnection = true;
    }

    const startTime = Date.now();
    await mongoose.connect(process.env.MONGODB_URI, options);
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ MongoDB connected successfully in ${connectionTime}ms`);
    
    // Safely log connection pool info
    try {
      if (mongoose.connection.db && mongoose.connection.db.serverConfig) {
        console.log(`📊 Connection pool size: ${mongoose.connection.db.serverConfig.s.pool.size}`);
      } else {
        console.log(`📊 MongoDB connected (pool info not available)`);
      }
    } catch (poolError) {
      console.log(`📊 MongoDB connected (pool info unavailable)`);
    }
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Connection details:', {
      uri: process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'),
      nodeEnv: process.env.NODE_ENV || 'development',
      directConnection: process.env.MONGODB_DIRECT === 'true' || false,
      appName: process.env.MONGODB_APPNAME || 'SkilledLinkBackend'
    });
    console.log('💡 Make sure MongoDB is running and accessible');
    if (/querySrv\s+ETIMEOUT/i.test(err.message || '')) {
      console.log('💡 Tip: SRV DNS lookup timed out. On Windows networks this can be DNS/IPv6 related. Try setting MONGODB_DIRECT=true and use a non-SRV mongodb:// URI if available.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;