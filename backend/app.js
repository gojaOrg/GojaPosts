var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");

const config = require("config");
const nodemailer = require("nodemailer");

//use config module to get the privatekey, if no private key set, end the application
if (!config.get("myprivatekey")) {
  console.log("hejsansvejsan");
  console.error("FATAL ERROR: myprivatekey is not defined.");
  process.exit(1);
}

// Adds environment variables, only in development
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// Connects to database
var db = require("./mongoose");

var indexRouter = require("./routes/index");
var postRouter = require("./routes/post");

var cookieParser = require("cookie-parser");

var app = express();

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  const url =
    process.env.NODE_ENV === "production"
      ? "https://www.gojacompany.com"
      : "http://localhost:8080";
  res.setHeader("Access-Control-Allow-Origin", url);

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use((req, res, next) => {
  if (req.originalUrl === "/pay/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/posts", postRouter);

// Use JSON parser for all non-webhook routes

//app.use(bodyParser.urlencoded({ extended: "false" }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
