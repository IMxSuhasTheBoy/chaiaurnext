import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to DB!!!");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {}); //* connection options as per requirement

    connection.isConnected = db.connections[0].readyState;

    console.log(`\nConnected to DB successfully !!!, ${db}\n`);
    console.log("connections :", db.connections);
  } catch (error) {
    console.log("\nFailed to connect to MongoDB! ! !", error);
    process.exit(1);
  }
}

export default dbConnect;
