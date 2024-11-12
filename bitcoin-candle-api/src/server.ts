import "dotenv/config";
import { connection } from "mongoose";
import { app } from "./app";
import { connectToMongoDB } from "./config/db";
import CandleMessageChannel from "./messages/CandleMessageChannel";

const createServer = async () => {
  await connectToMongoDB();
  console.log("Connected to mongoDB");
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () =>
    console.log(`App running on port ${PORT}`)
  );

  const candleMsgChannel = new CandleMessageChannel(server);
  candleMsgChannel.consumeMessages();

  process.on("SIGINT", async () => {
    await connection.close();
    server.close();
    console.log("App server and connection to MongoDB closed");
  });
};

createServer();
