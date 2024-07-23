import crypto from "crypto";
import express from "express";
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({ path: "./env.local" });
// const { REDIS_HOST, REDIS_PORT, REDIS_DB, APP_PORT } = process.env;
// console.log("REDIS_HOST:", REDIS_HOST, "\nREDIS_PORT:", REDIS_PORT, "\nREDIS_DB:", REDIS_DB, "\nAPP_PORT:", APP_PORT);

/**
 * Generates a random hash using SHA-256 algorithm.
 *
 * @return {string} The hexadecimal representation of the generated hash.
 */
function generateRandomHash() {
  // Generate a random string
  const randomString = crypto.randomBytes(32).toString("hex");

  // Create a hash object using SHA-256
  const hashObject = crypto.createHash("sha256");
  hashObject.update(randomString);

  // Return the hexadecimal representation of the hash
  return hashObject.digest("hex");
}

// ###### redis client

const client = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  database: process.env.REDIS_DB,
});

client
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("connect", () => console.log("Connected to Redis"))
  .on("end", () => console.log("Redis ended"));

await client.connect();

// set a value in redis
await client.set("hash", generateRandomHash());

// retrieve a value from redis
console.log("hash:", await client.get("hash"));

// ###### app (express)

const app = express();

app
  .get("/", async (req, res) => {
    const val = await client.get("hash");
    res.send(val);
  })
  .listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port ${process.env.APP_PORT}`);
  });