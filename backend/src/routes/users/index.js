const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

router.post("/sign-up", async (req, res) => {
  const { display_name, email, password, username } = req.body;

  if (!display_name || !email || !password || !username) {
    return res.status(400).json({ error: "Some fields are missing." });
  }

  const salt = await bcrypt.genSalt();
  hashedPassword = await bcrypt.hash(password, salt);

  await sequelize.models.User.create({
    display_name,
    email,
    password: hashedPassword,
    username,
  });

  res.status(201).json({ message: "User created successfully." });
});

module.exports = router;
