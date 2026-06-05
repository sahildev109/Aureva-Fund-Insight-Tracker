const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not set in the environment variables.');
    process.exit(1);
  }

  const maxRetries = 5;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`MongoDB connection failed (Attempt ${attempt}/${maxRetries}):`, err.message);
      if (attempt === maxRetries) {
        console.error('All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }
      attempt++;
      // Wait for 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
