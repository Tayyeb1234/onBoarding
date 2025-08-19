// utils/generateOTP.js

/**
 * Generates a 6-digit numeric OTP.
 * @returns {String} - The generated OTP.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOTP;
