const mongoose = require("mongoose");

const dbname = process.env.NODE_ENV === "production" ? "prod" : "GojaPosts";

console.log("-----");
console.log("this is the " + dbname + " database");
console.log("-----");

mongoose.set("useCreateIndex", true);
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.zvtmp.mongodb.net/${dbname}?retryWrites=true&w=majority`,
  //lägg till env-variabel till den övre
  // `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@meco-ju6ws.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.set("useFindAndModify", false);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error:"));
db.once("open", function () {
  console.log("Connected to database");
});

module.exports = db;
