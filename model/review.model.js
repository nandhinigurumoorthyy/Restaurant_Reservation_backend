const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    comments: {
      type: String,
      required: true,
    },
    photosLink: {
      type: String,
      required: [true, "Photo link is required"],
    },
    starRatings: {
      type: Number,
      required: [true, "Ratings is required"],
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    username: {
      type: String,
      required: [true, "username is required"],
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

const ReviewModel = mongoose.model("review", ReviewSchema);

module.exports = ReviewModel;
