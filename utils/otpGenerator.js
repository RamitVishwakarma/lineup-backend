const crypto = require("crypto");

const generateOtp = () => crypto.randomInt(100000, 999999);

module.exports = generateOtp;
