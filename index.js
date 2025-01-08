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
const reservations = require("./model/reserve.model"); // Adjust path as needed
const { ObjectId } = require("mongodb");
const ReviewModel = require("./model/review.model");
const app = express();
const paymentRoutes = require("./routes/payment");

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://0.0.0.0:10000",
      "https://restaurant-reservation-ui.netlify.app",
    ],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

// Middleware to verify JWT token
const verifyJwt = (req, res, next) => {
  const token = req.cookies.token; // JWT token is stored in cookies

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "default_secret_key"
    );
    req.user = decoded; // Add decoded user data to request object
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

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
      process.env.JWT_SECRET_KEY || "default_secret_key",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }); // Set JWT in cookie
    res.json({
      status: "Success",
      user: { email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ status: "ERROR", message: "Internal server error" });
  }
});

// Reserve a table at a restaurant
app.post("/restaurants/:restaurantId/reservepage", async (req, res) => {
  const { date, partySize, partyTime, contact, email, username, restaurantId } =
    req.body;

  if (!date || !partySize || !partyTime || !contact) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find restaurant by restaurantId
    const restaurant = restaurantData.find(
      (rst) => rst.id === parseInt(restaurantId, 10)
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create and save reservation
    const reservation = new ReserveModel({
      date,
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

    await reservation.save();
    res.status(201).json({
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// get bookings
app.get("/api/bookings", (req, res) => {
  const { email } = req.query; // Get email from query parameters
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Query the database to fetch bookings for the provided email
  reservations
    .find({ email })
    .then((reservations) => {
      res.json(reservations); // Send the reservations as a JSON response
    })
    .catch((err) => {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Error fetching bookings", error: err });
    });
});

// delete booking
// Ensure you import ObjectId if necessary

app.delete("/api/bookings/:id", async (req, res) => {
  const bookingId = req.params.id;

  try {
    // Use findByIdAndDelete to delete the document directly by ID
    const result = await reservations.findByIdAndDelete(bookingId);

    if (result) {
      res.status(200).json({ message: "Booking deleted successfully!" });
    } else {
      res.status(404).json({ message: "Booking not found!" });
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Error deleting booking", error });
  }
});

// edit the booking
app.put("/api/bookings/:id", async (req, res) => {
  const bookingId = req.params.id;
  const { partySize, date, partyTime } = req.body; // Only update specific fields

  try {
    const result = await reservations.findByIdAndUpdate(
      bookingId,
      { partySize, date, partyTime },
      { new: true } // Return the updated document
    );

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Booking not found!" });
    }
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Error updating booking", error });
  }
});

// Create a review
app.post("/restaurants/:restaurantId/review", async (req, res) => {
  const {
    email,
    username,
    restaurantId,
    restaurantLocation,
    restaurantName,
    comments,
    photosLink,
    starRatings,
  } = req.body;

  // Validate required fields
  if (!comments || !photosLink || !starRatings) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (starRatings < 1 || starRatings > 5) {
    return res
      .status(400)
      .json({ message: "Star ratings must be between 1 and 5." });
  }

  try {
    // Validate user existence
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate restaurant existence (assuming you have restaurant data in the database)
    const restaurant = restaurantData.find(
      (rst) => rst.id === parseInt(restaurantId, 10)
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create the review object
    const newReview = new ReviewModel({
      user: user._id,
      restaurantId,
      restaurantName,
      restaurantLocation,
      comments,
      email,
      username,
      photosLink,
      starRatings: parseInt(starRatings, 10),
      createdAt: new Date(),
    });

    // Save the review to the database
    const savedReview = await newReview.save();

    return res.status(201).json({
      message: "Review created successfully!",
      review: savedReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
});

// Get all reviews for a specific user by email
app.get("/api/reviews", async (req, res) => {
  const { email } = req.query;

  try {
    const reviews = await ReviewModel.find({ email });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Edit a review (findOneAndUpdate)
app.put("/api/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;
  const { comments, photosLink, starRatings } = req.body;

  if (starRatings < 1 || starRatings > 5) {
    return res
      .status(400)
      .json({ message: "Star ratings must be between 1 and 5." });
  }

  try {
    const updatedReview = await ReviewModel.findOneAndUpdate(
      { _id: reviewId },
      { comments, photosLink, starRatings },
      { new: true } // Return the updated document
    );

    if (updatedReview) {
      res.status(200).json(updatedReview);
    } else {
      res.status(404).json({ message: "Review not found." });
    }
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a review (findOneAndDelete)
app.delete("/api/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;

  try {
    const deletedReview = await ReviewModel.findOneAndDelete({ _id: reviewId });

    if (deletedReview) {
      res.status(200).json({ message: "Review deleted successfully." });
    } else {
      res.status(404).json({ message: "Review not found." });
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET API to fetch reviews by restaurant name
app.get("/apirst/reviews/:restaurantName", async (req, res) => {
  const { restaurantName } = req.params; // Extract restaurantName from query parameters

  if (!restaurantName) {
    return res.status(400).json({ message: "Restaurant name is required." });
  }

  try {
    // Fetch reviews that match the given restaurant name
    const reviews = await ReviewModel.find({ restaurantName });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this restaurant." });
    }

    res.status(200).json(reviews); // Send the fetched reviews as a response
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// api payment
app.use("/restaurants/:restaurantId/reservepage/api/payment", paymentRoutes);

// Starting the server
app.listen(process.env.PORT, process.env.HOSTNAME, function () {
  createDbConnection();
});
