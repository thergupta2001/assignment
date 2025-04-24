const express = require("express");
const mongoose = require("mongoose");
const { users } = require("./schema.js");
const bcrypt = require("bcrypt");

const connectDB = async () => {
  await mongoose.connect("mongodb://localhost:27017/users");
};
connectDB();
const app = express();

app.use(express.json());

app.post("/user", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Type check values
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).send("Please enter valid data");
    }

    if (!username || !email || !password) {
      res.status(400).send("Please enter all fields");
    }

    const hashed = await bcrypt.hash(password, 10);
    const existingUser = await users.find({ email });
    if (existingUser) {
      res.status(400).send("User already exists");
    }

    const user = new users({ username, email, hashed});

    res.status(200).send("User created");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
