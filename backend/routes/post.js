var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Post = require("../models/postModel");
const mongoose = require("mongoose");
const upload = require("../middleware/audioUpload");
const ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");

router.get("/my-posts/:id", async (req, res) => {
  try {
    var posts = await Post.find({ "user.id": req.params.id });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    var posts = await Post.find();
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  var id = req.params.id;
  var jobs = await Products.find(
    { user: id },
    {
      desc: 1,
      photos: 1,
    }
  );
  res.json(jobs);
});

router.post(
  "/add-jobpictures",
  upload.array("photos", 12),
  function (req, res) {
    var fileLocations = [];
    console.log(req.files);
    for (i = 0; i < req.files.length; i++) {
      fileLocations.push(req.files[i].location);
    }
    res.json(fileLocations);
  }
);
router.post("/upload-audio", upload.single("file"), async function (req, res) {
  // Respond with URL of file at AWS S3
  res.json(req.file.location);
});
router.post("/", async (req, res, next) => {
  console.log("POSTS END POINT");
  console.log(req.body);
  const form = req.body;

  try {
    const post = new Post({
      hashtags: form.hashtags,
      audio: form.audio,
      inReplyToUser: form.replyUserId,
      "user.id": form.user.id,
      "user.profileAudio": form.user.profileAudio,
      "user.profilePicture": form.user.profilePicture,
      "user.userName": form.user.userName,
      "user.email": form.user.email,
    });
    await post.save();
    res.status(200).json(post);
    console.log("Post posted to database");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/like", async (req, res) => {
  const likeObject = req.body;
  const postId = likeObject.id;
  const user = likeObject.user;
  const filter = { _id: postId, "likedByUsers.userId": { $ne: user.userId } };
  const update = {
    $inc: { likes: 1 },
    $push: { likedByUsers: user },
  };
  const doc = await Post.findOneAndUpdate(filter, update, { new: true });
  if (doc === null) {
    res
      .status(409)
      .json({ message: "User has already liked the post or wrong post ID" });
  } else {
    res.status(200).json({ updatedPost: doc });
  }
});

router.post("/unlike", async (req, res) => {
  const unlikeObject = req.body;
  const postId = unlikeObject.id;
  const user = unlikeObject.user;
  const filter = { _id: postId, "likedByUsers.userId": user.userId };
  const update = {
    $inc: { likes: -1 },
    $pull: { likedByUsers: { userId: user.userId } },
  };
  const doc = await Post.findOneAndUpdate(filter, update, { new: true });
  if (doc === null) {
    res
      .status(409)
      .json({ message: "User has not liked post or wrong post ID" });
  } else {
    res.status(200).json({ postObject: doc });
  }
});
module.exports = router;
