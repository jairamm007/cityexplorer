const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = String(process.env.MONGODB_URI || '').trim();
  const fallbackUri = String(process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/cityexplorer').trim();

  if (!primaryUri && !fallbackUri) {
    console.error('No MongoDB URI configured. Set MONGODB_URI or MONGODB_URI_LOCAL in .env');
    process.exit(1);
  }

  const connect = async (uri) => mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    if (primaryUri) {
      await connect(primaryUri);
      console.log('MongoDB connected successfully to primary URI');
      return;
    }

    await connect(fallbackUri);
    console.log('MongoDB connected successfully to fallback URI');
  } catch (error) {
    if (primaryUri && fallbackUri && primaryUri !== fallbackUri) {
      console.warn(`Primary MongoDB connection failed: ${error.message}`);
      try {
        await connect(fallbackUri);
        console.log('MongoDB connected successfully to fallback URI');
        return;
      } catch (fallbackError) {
        console.error('Fallback MongoDB connection error:', fallbackError.message);
      }
    } else {
      console.error('MongoDB connection error:', error.message);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
