import mongoose from "mongoose";

const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection failed", error);
    process.exit(1);
  }
};

export default DBConnection;
