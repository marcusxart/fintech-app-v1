// utils/otpGenerator.js
const crypto = require("crypto");

/**
 * Generate an OTP
 * @param {number} length - Length of OTP (default 6)
 * @param {string} type - "numeric" | "alphanumeric"
 * @returns {string} OTP code
 */
function generateOtp(length = 6, type = "numeric") {
  if (type === "numeric") {
    // Only digits
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // 0-9
    }
    return otp.toString("base64");
  }

  if (type === "alphanumeric") {
    // Secure alphanumeric code
    return crypto
      .randomBytes(length)
      .toString("base64") // convert to text
      .replace(/[^a-zA-Z0-9]/g, "") // strip special chars
      .substring(0, length);
  }

  throw new Error("Invalid OTP type");
}

module.exports = { generateOtp };
