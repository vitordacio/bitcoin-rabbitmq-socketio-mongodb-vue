import "dotenv/config";
import { connect } from "mongoose";

export const connectToMongoDB = async () => {
  await connect(process.env.MONGODB_CONNECTION_URL);
};
