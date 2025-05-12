const Otp = require("../models/otp.model");
const generateOtp = require("../utils/otpGenerator");
const sendEmail = require("../utils/sendEmail");

// remove it in the end
exports.clearOtpDatabase = async (req, res) => {
  try {
    await Otp.deleteMany({});
    res.status(200).json({ message: "All OTP records cleared successfully" });
  } catch (err) {
    console.error("Database Clear Error:", err);
    res.status(500).json({ message: "Error clearing OTP records" });
  }
};

const rateLimit = {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000,
  blockDuration: 24 * 60 * 60 * 1000,
};

exports.generateOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const attempts = await Otp.countDocuments({
      $or: [{ email }],
      createdAt: { $gte: new Date(Date.now() - rateLimit.windowMs) },
    });

    if (attempts >= rateLimit.maxAttempts) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
        nextAttemptAllowed: new Date(Date.now() + rateLimit.blockDuration),
      });
    }

    if (email) {
      await Otp.deleteMany({ email: email });
    }

    const otp = generateOtp();
    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + 5 * 60 * 1000);

    const otpRecord = new Otp({
      email: email,
      otp: otp,
      expiration: expirationTime,
      attempts: 0,
    });

    try {
      if (email) {
        await sendEmail(email, otp);
      }
    } catch (sendError) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw sendError;
    }
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Generation Error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp: enteredOtp } = req.body;

  try {
    const otpRecord = req.otpRecord;

    if (!otpRecord) return res.status(404).json({ error: "OTP not found" });

    if (otpRecord.otp !== parseInt(enteredOtp))
      return res.status(400).json({ error: "Invalid OTP" });

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};
