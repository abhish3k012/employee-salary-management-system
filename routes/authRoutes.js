const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username, email, and password" });
    }

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      return res.status(400).json({
        message:
          userExists.email === email
            ? "User already exists with this email"
            : "Username is already taken",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully!",
      userId: newUser.id,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error during registration.",
        error: error.message,
      });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, username, userName, password } = req.body;
    const loginIdentifier = email || username || userName;

    if (!loginIdentifier || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: loginIdentifier }, { username: loginIdentifier }],
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.status(200).json({
      message: "Logged in successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
