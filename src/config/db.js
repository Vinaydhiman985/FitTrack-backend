import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://VinayDhiman:Vinay%40123%23@fittrack.uxqbtvq.mongodb.net/fittrack?appName=FitTrack";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;