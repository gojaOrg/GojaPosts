const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const config = require("config");
//const bcrypt = require("bcrypt");

const PostSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  hashtags: {
    type: [String],
    default: [],
  },
  audio: {
    type: String,
    required: true,
  },
  audioFileType: {
    type: String,
    required: true,
  },
  inReplyToPostId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    profileAudio: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  likes: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  likedByUsers: {
    type: [{ userName: String, userId: String }],
    default: [],
  },
});

const postModel = new mongoose.model("Post", PostSchema);
module.exports = postModel;
