var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Post = require("../models/postModel");
const Like = require("../models/likesModel");
const mongoose = require("mongoose");
const upload = require("../middleware/audioUpload");
const ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");

var emojis = {
  5: "🥚",
  10: "🐣",
  tenComments: "🎉",
  tenCommentsTenLikes: "🥳",
  20: "💛",
  40: "🧡",
  100: "🐥",
  200: "🐔",
  400: "❤️‍🔥",
  1000: "🔥",
  2000: "☄️",
  1000000: "🦄",
};

router.get("/my-posts/:id", async (req, res) => {
  try {
    var posts = await Post.find({ "user._id": req.params.id }).sort({
      _id: -1,
    });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/by-id/:id", async (req, res) => {
  try {
    var post = await Post.findById(req.params.id);
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    var posts = await Post.find({ inReplyToPostId: { $eq: null } })
      .limit(10)
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/replies/:id", async (req, res) => {
  try {
    var replies = await Post.find({ inReplyToPostId: req.params.id });
    res.json(replies);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/hashtag", async (req, res) => {
  const searchString = req.query.search;
  try {
    var replies = await Post.find({ hashtags: searchString });
    console.log(replies);
    res.json(replies);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/search-hashtag", async (req, res) => {
  const searchString = req.query.search;
  const regex = new RegExp(escapeRegex(searchString), "gi");
  try {
    await Post.find({ hashtags: regex }, (error, foundUsers) => {
      if (error) {
        console.log(error);
        res
          .status(500)
          .json({ message: "Something went wrong searching mongoDB" });
      } else {
        res.status(200).json(foundUsers);
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "You fucked up the server" });
  }
});

router.post(
  "/add-jobpictures",
  upload.array("photos", 12),
  function (req, res) {
    var fileLocations = [];
    for (i = 0; i < req.files.length; i++) {
      fileLocations.push(req.files[i].location);
    }
    res.json(fileLocations);
  }
);

router.post("/my-feed", async (req, res, next) => {
  const form = req.body;
  try {
    var posts = await Post.find({
      $or: [
        {
          "user._id": { $in: form.following.map((x) => ObjectId(x.userId)) },
          inReplyToPostId: { $eq: null },
        },
        { "user._id": form.userId, inReplyToPostId: { $eq: null } },
      ],
    })
      .limit(10)
      .sort({ created_at: -1 })
      .lean();

    const hasLiked = await Like.find({ userId: form.userId });

    posts.forEach((post) => {
      const found = hasLiked.some((el) => el.postId === String(post._id));
      if (found) {
        post.hasLiked = true;
      } else {
        post.hasLiked = false;
      }
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/my-feed/more", async (req, res) => {
  const form = req.body;
  var minCreatedDateFromLastResult = form.minDate;
  try {
    var posts = await Post.find({
      $or: [
        {
          "user._id": { $in: form.following.map((x) => ObjectId(x.userId)) },
          created_at: { $lt: minCreatedDateFromLastResult },
          inReplyToPostId: { $eq: null },
        },
        {
          "user._id": form.userId,
          created_at: { $lt: minCreatedDateFromLastResult },
          inReplyToPostId: { $eq: null },
        },
      ],
    })
      .limit(10)
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/upload-audio", upload.single("file"), async function (req, res) {
  // Respond with URL of file at AWS S3
  res.json(req.file.location);
});

router.post("/", async (req, res, next) => {
  const form = req.body;
  try {
    const post = new Post({
      hashtags: form.hashtags,
      caption: form.caption,
      audio: form.audio,
      audioFileType: form.audioFileType,
      inReplyToPostId: form.inReplyToPostId,
      "user._id": form.user.id,
      "user.profileAudio": form.user.profileAudio,
      "user.profilePicture": form.user.profilePicture,
      "user.userName": form.user.userName,
      "user.email": form.user.email,
    });
    await post.save();

    // Add comment count to the parent post if this post is commnet
    if (form.inReplyToPostId) {
      await Post.findOneAndUpdate(
        { _id: form.inReplyToPostId },
        { $inc: { commentCount: 1 } }
      );
    }
    res.status(200).json(post);
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
  const hasLiked = await Like.find({ postId: postId, userId: user.id });
  console.log(hasLiked);
  if (hasLiked.length > 0) {
    console.log("already liked");
    res
      .status(409)
      .json({ message: "User has already liked the post or wrong post ID" });
  } else {
    const likeObject = new Like({
      postId: postId,
      userId: user.id,
      userName: user.userName,
    });
    await likeObject.save();
    var postAfterLike = await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { likes: 1 } }
    );
    var likes = postAfterLike.likes;
    var funkyStatus = emojis[likes];
    if (funkyStatus) {
      await Post.findByIdAndUpdate(postId, {
        funkyStatus: funkyStatus,
      });
    }
    res.status(200).json(postAfterLike);
  }
});

router.post("/unlike", async (req, res) => {
  const unlikeObject = req.body;
  const postId = unlikeObject.id;
  const user = unlikeObject.user;

  const hasLiked = await Like.find({ postId: postId, userId: user.id });

  if (hasLiked.length == 0) {
    res
      .status(409)
      .json({ message: "User has not liked post or wrong post ID" });
  } else {
    await Like.deleteOne({
      postId: postId,
      userId: user.id,
    });
    var postAfterLike = await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { likes: -1 } }
    );
    res.status(200).json(postAfterLike);
  }
});
module.exports = router;
