const mongoose = require("mongoose");

const ReserveSchema = mongoose.Schema(
  {
    date: {
      // Changed to only use date
      type: Date,
      required: [true, "Reservation date is required"], // Only one date field
    },
    partySize: {
      type: Number,
      required: [true, "Party size is required"],
      min: [1, "Party size must be at least 1"],
      max: [100, "Party size must be no more than 100"],
    },
    partyTime: {
      type: String,
      required: [true, "Party time is required"],
      enum: ["Morning", "Lunch", "Evening", "Dinner"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Reference to User model
      required: [true, "User is required"],
    },
    contact: {
      type: Number,
      required: [true, "Contact number is required"],
      min: [1000000000, "Contact number must be at least 10 digits"],
      max: [9999999999, "Contact number must be no more than 10 digits"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    username: {
      type: String,
      required: [true, "Email is required"],
    },
    restaurantId: {
      type: String, // Matches the ID from restaurant.json
      required: true,
    },
    restaurantName: {
      type: String,
      required: true, // Store the restaurant name
    },
    restaurantLocation: {
      type: String,
      required: true, // Store the restaurant location
    },
  },
  { timestamps: true }
);

const ReserveModel = mongoose.model("Reservation", ReserveSchema);

module.exports = ReserveModel;
