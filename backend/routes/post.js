var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Post = require("../models/postModel");
const mongoose = require("mongoose");
const upload = require("../middleware/audioUpload");
const ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");

router.get("/:id", async (req, res) => {
  try {
    var posts = await Post.find({ "user.id": req.params.id });
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
  console.log(req.body);
  const form = req.body;

  try {
    const post = new Post({
      hashtags: form.hashtags,
      audio: form.audio,
      inReplyToID: form.replyPostId,
      inReplpyToUser: form.replyUserId,
      "user.id": form.user.id,
      "user.profileAudio": form.user.profileAudio,
      "user.profilePicture": form.user.profilePicture,
      "user.userName": form.user.userName,
      "user.bio": form.user.bio,
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
module.exports = router;
