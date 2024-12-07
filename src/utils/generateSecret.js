import crypto from "crypto";

// Generate a random 64-character hex string
const secret = crypto.randomBytes(32).toString("hex");
console.log("Generated JWT Secret:", secret);
