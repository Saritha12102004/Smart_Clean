// ================= IMPORTS =================
console.log(">>> Running backend/server.js <<<");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const User = require("./models/User");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({ origin: "*" }));
app.use(express.json());

// ================= STATIC FILES =================
app.use(express.static(path.join(__dirname, "../public")));

// ================= DATABASE =================
mongoose.connect("mongodb://127.0.0.1:27017/smartclean")

.then(() => {

  console.log("✅ MongoDB Connected");

})

.catch((err) => {

  console.error("❌ MongoDB Connection Error:", err);

});

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "../public/register.html")
  );

});

// ================= REGISTER API =================
app.post("/api/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      age
    } = req.body;

    // ================= VALIDATION =================
    if (!name || !email || !password || !age) {

      return res.status(400).json({
        message: "All fields are required"
      });

    }

    // ================= CHECK EXISTING USER =================
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: "Email already registered"
      });

    }

    // ================= HASH PASSWORD =================
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ================= CREATE USER =================
    const newUser = new User({

      name,
      email,
      password: hashedPassword,
      age,

      role: age >= 18 ? "adult" : "minor",

      points: 0,
      uploads: 0,

      uploadedImages: [],

      verifiedUploads: 0,
      rejectedUploads: 0

    });

    await newUser.save();

    console.log("✅ User Registered:", newUser);

    res.json({
      message: "User registered successfully"
    });

  }

  catch (error) {

    console.error("❌ Register Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= LOGIN API =================
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // ================= FIND USER =================
    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    // ================= CHECK PASSWORD =================
    const isMatch =
      await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid password"
      });

    }

    console.log("✅ Login Success:", email);

    res.json(user);

  }

  catch (error) {

    console.error("❌ Login Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= GET USER =================
app.get("/api/user/:email", async (req, res) => {

  try {

    const user =
      await User.findOne({
        email: req.params.email
      });

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    res.json(user);

  }

  catch (error) {

    console.error("❌ Get User Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= UPLOAD API =================
app.post("/api/upload", async (req, res) => {

  try {

    console.log("📸 Upload API called:", req.body);

    const {
      email,
      imageName
    } = req.body;

    // ================= VALIDATION =================
    if (!email || !imageName) {

      return res.status(400).json({
        message: "Missing image data"
      });

    }

    // ================= FIND USER =================
    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    // ================= INITIALIZE ARRAY =================
    if (!user.uploadedImages) {

      user.uploadedImages = [];

    }

    // ================= NORMALIZE IMAGE NAME =================
    const normalizedImageName =
      imageName.trim().toLowerCase();

    // ================= DUPLICATE CHECK =================
    const alreadyUploaded =
      user.uploadedImages.some(
        img =>
          img.imageName &&
          img.imageName
            .trim()
            .toLowerCase() === normalizedImageName
      );

    if (alreadyUploaded) {

      console.log("❌ Duplicate Image Detected");

      return res.status(400).json({
        message: "❌ This image was already uploaded!"
      });

    }

    // ================= SAVE IMAGE =================
    user.uploadedImages.push({

      imageName: normalizedImageName,
      status: "pending"

    });

    // ================= UPDATE UPLOAD COUNT =================
    user.uploads += 1;

    await user.save();

    console.log("✅ Updated User:", user);

    res.json({

      message: "✅ Upload successful",
      user

    });

  }

  catch (error) {

    console.error("❌ Upload Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= ADMIN LOGIN =================
app.post("/api/admin/login", (req, res) => {

  const {
    username,
    password
  } = req.body;

  if (
    username === "admin" &&
    password === "admin123"
  ) {

    return res.json({
      success: true,
      message: "Admin Login Successful"
    });

  }

  res.status(400).json({
    message: "Invalid Admin Credentials"
  });

});

// ================= ADMIN USERS =================
app.get("/api/admin/users", async (req, res) => {

  try {

    const users = await User.find();

    res.json(users);

  }

  catch (error) {

    console.error("❌ Admin Users Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= APPROVE UPLOAD =================
app.post("/api/admin/approve", async (req, res) => {

  try {

    const {
      email,
      imageName
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    // ================= FIND IMAGE =================
    const image =
      user.uploadedImages.find(
        img => img.imageName === imageName
      );

    if (!image) {

      return res.status(400).json({
        message: "Image not found"
      });

    }

    // ================= PREVENT RE-APPROVAL =================
    if (image.status === "approved") {

      return res.status(400).json({
        message: "Already approved"
      });

    }

    // ================= UPDATE STATUS =================
    image.status = "approved";

    // ================= ADD POINTS =================
    user.points += 10;

    // ================= VERIFIED COUNT =================
    user.verifiedUploads += 1;

    await user.save();

    console.log("✅ Upload Approved");

    res.json({
      message: "✅ Upload Approved & Points Added"
    });

  }

  catch (error) {

    console.error("❌ Approve Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= REJECT UPLOAD =================
app.post("/api/admin/reject", async (req, res) => {

  try {

    const {
      email,
      imageName
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    // ================= FIND IMAGE =================
    const image =
      user.uploadedImages.find(
        img => img.imageName === imageName
      );

    if (!image) {

      return res.status(400).json({
        message: "Image not found"
      });

    }

    // ================= PREVENT RE-REJECT =================
    if (image.status === "rejected") {

      return res.status(400).json({
        message: "Already rejected"
      });

    }

    // ================= UPDATE STATUS =================
    image.status = "rejected";

    // ================= REJECTED COUNT =================
    user.rejectedUploads += 1;

    await user.save();

    console.log("❌ Upload Rejected");

    res.json({
      message: "❌ Upload Rejected"
    });

  }

  catch (error) {

    console.error("❌ Reject Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

// ================= SERVER =================
const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

});