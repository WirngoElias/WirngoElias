const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      "MONGO_URI is not defined. Please add it to server/.env or your environment variables."
    );
  }

  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);
    console.error(
      "Verify the URI, DNS/network access, and MongoDB Atlas IP whitelist or local MongoDB service."
    );
    throw error;
  }
};

module.exports = connectDB;
