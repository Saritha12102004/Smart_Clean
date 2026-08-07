const mongoose = require("mongoose");

// ================= IMAGE SCHEMA =================
const UploadSchema = new mongoose.Schema({

  imageName: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "pending"
  }

});

// ================= USER SCHEMA =================
const UserSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  role: {
    type: String,
    enum: ["minor", "adult"]
  },

  points: {
    type: Number,
    default: 0
  },

  uploads: {
    type: Number,
    default: 0
  },

  verifiedUploads: {
    type: Number,
    default: 0
  },

  rejectedUploads: {
    type: Number,
    default: 0
  },

  uploadedImages: [UploadSchema]

}, { timestamps: true });

module.exports =
mongoose.model("User", UserSchema);