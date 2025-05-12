const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  zealId: {
    type: String,
    unique: true,
  },
  avatar: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8],
    default: 1,
  },
  membersFound: {
    type: Number,
    default: 0,
  },
  startGame: {
    type: Date,
  },
  locationUpdate: {
    type: Date,
  },
  started: {
    type: Boolean,
    default: false,
  },
  gameDuration: {
    type: Number, // Assuming you want to store duration in milliseconds
    default: 0,
  },
  latitude: {
    type: Number, // Assuming I want to store latitude as a number
    default: 0,
  },
  longitude: {
    type: Number, // Assuming I want to store longitude as a number
    default: 0,
  },
  scannedCodes: {
    type: [ObjectId],
    default: [],
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
