const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, age, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Age Verification & Role Assignment
    const role = age < 18 ? "Minor User" : "Adult User";

    const user = new User({
      name,
      age,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    res.json({ message: "User Registered Successfully", role });

  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "SECRETKEY", { expiresIn: "1h" });

  res.json({
    token,
    user: {
      name: user.name,
      age: user.age,
      role: user.role,
      points: user.points
    }
  });
});

module.exports = router;