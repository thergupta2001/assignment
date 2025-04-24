const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { users } = require("./schema.js");
const bcrypt = require("bcrypt");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/grow");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
};
connectDB();

const app = express();
app.use(express.json());

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post("/user", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check for missing or invalid types
    if (!username || !email || !password) {
      return res.status(400).send("Please enter all fields");
    }
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).send("Please enter valid data");
    }

    // 2. Additional validations
    if (!isValidEmail(email)) {
      return res.status(400).send("Invalid email format");
    }
    if (password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters");
    }

    // 3. Check for duplicates
    const existingUser = await users.findOne({ email });
    const existingUsername = await users.findOne({ username });
    if (existingUser || existingUsername) {
      return res.status(400).send("User already exists");
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save to DB
    const user = new users({ username, email, password: hashedPassword });
    await user.save();

    // 6. Optional: Also save to JSON file
    const fileData = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    fs.writeFileSync(
      `user_${user._id}.json`,
      JSON.stringify(fileData, null, 2)
    );

    // 7. Return response
    res.status(201).json({
      message: "User created successfully",
      userId: user._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
