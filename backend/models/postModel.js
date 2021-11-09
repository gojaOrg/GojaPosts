const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");

const PostSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  text: {
    type: String,
  },
  audio: {
    type: String,
    required: true,
  },
  inReplyToID: {
    type: mongoose.Schema.Types.ObjectId,
  },
  inReplyToUser: {
    type: mongoose.Schema.Types.ObjectId,
  },
  user: {
    id: {
      type: String,
    },
    profileAudio: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    userName: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
  },
  likes: {
    type: Number,
  },
});

const postModel = new mongoose.model("Post", PostSchema);
module.exports = postModel;