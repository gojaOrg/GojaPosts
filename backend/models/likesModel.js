const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const config = require("config");

const LikesSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  postId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

const likesModel = new mongoose.model("Likes", LikesSchema);
module.exports = likesModel;
