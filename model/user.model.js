const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: [1, "Age must be at least 1"], // Ensures age is >= 1
      max: [120, "Age must be no more than 120"], // Ensures age is <= 120
    },
    contact: {
      type: Number,
      required: true,
    },
  },

  { timestamps: true }
);

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
