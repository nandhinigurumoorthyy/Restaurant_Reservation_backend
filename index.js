const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { createDbConnection } = require("./db");
const UserModel = require("./model/user.model");
const ReserveModel = require("./model/reserve.model");
const restaurantData = JSON.parse(
  fs.readFileSync("./Restaurant.json", "utf-8")
);

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://0.0.0.0:10000"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use(cookieParser());

// API Route for creating a user
app.post("/create", async (req, res) => {
  console.log(req.body);
  try {
    const user = new UserModel(req.body);
    const result = await user.save();
    res.json({ status: "Success", user: result });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// API Route for user login
app.post("/login", async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "No record exists" });
    }

    if (password !== user.password && username !== user.username) {
      return res
        .status(401)
        .json({ status: "ERROR", message: "Incorrect password or username" });
    }

    const token = jwt.sign(
      { email: user.email, username: user.username },
      `${process.env.JWT_SECRET_KEY}` || "default_secret_key",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.json({
      status: "Success",
      user: { email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ status: "ERROR", message: "Internal server error" });
  }
});

// reserve page
app.post("/restaurants/:restaurantId/reservepage", async (req, res) => {
  try {
    const {
      date, // Changed from fromDate, toDate to a single date field
      partySize,
      partyTime,
      contact,
      email,
      username,
      restaurantId,
    } = req.body;

    // Validate input fields
    if (
      !date ||
      !partySize ||
      !partyTime ||
      !contact 
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user based on email (assuming email exists in User model)
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the restaurant by matching restaurantId from the restaurant.json file
    const restaurant = restaurantData.find(
      (rst) => rst.id === parseInt(restaurantId, 10)
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create a new reservation
    const reservation = new ReserveModel({
      date, // Only one date field
      partySize,
      partyTime,
      contact,
      email,
      user: user._id,
      restaurantId,
      username,
      restaurantName: restaurant.name,
      restaurantLocation: restaurant.location,
    });

    // Save the reservation to the database
    await reservation.save();

    // Send success response
    res.status(201).json({
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});


// Starting the server
app.listen(`${process.env.PORT}`, `${process.env.HOSTNAME}`, function () {
  createDbConnection();
});
