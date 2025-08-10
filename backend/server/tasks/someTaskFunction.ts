import winston from "winston";
import fetch from "node-fetch"; // Add this if using Node.js without native fetch

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.colorize(), // Colorize logs in the console
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "task.log" }),
  ],
});

export const someTaskFunction = async () => {
  const startTime = Date.now(); // Track when the task starts
  try {
    logger.info("Starting task...");
    const data = await fetch("https://api.example.com/data");

    // Handle non-200 HTTP responses
    if (!data.ok) {
      throw new Error(`Failed to fetch data: ${data.statusText}`);
    }

    const json = await data.json();
    logger.info("Fetched data:", json);
  } catch (error) {
    logger.error("Error during task execution:", error);
  } finally {
    const endTime = Date.now();
    const duration = endTime - startTime;
    logger.info(`Task finished in ${duration} ms`);
  }
};
