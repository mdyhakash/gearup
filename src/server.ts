import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    app.listen(config.port, () => {
      console.log(`Server running at at port ${config.port}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

main();
