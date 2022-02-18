var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session); //session here is a parameter for require
var passport = require("passport");
var authenticate = require("./authenticate");
var config = require("./config");

const data = require("./adddata");
//Mongo services is turned off,turn on in services.msc in run

//Router connections of express api
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");
var uploadRouter = require("./routes/uploadRouter");
var favoriteRouter = require("./routes/favoriteRouter");
var commentRouter = require("./routes/commentRouter");

//Data base stuff
const mongoose = require("mongoose");

const Dishes = require("./models/dishes");

const url = process.env.MONGO_URL || config.mongoUrl;
const connect = mongoose.connect(url); // connecting to db

const start = async () => {
  try {
    await connect
      .then(
        (db) => {
          console.log("Connected correctly to db");
        },
        (err) => {
          console.log(err);
          process.exit(1);
          // throw new Error("Unable to connect to server");
        }
      )
      .catch((err) => console.log("Unable to Connect to db"));
  } catch (err) {
    throw new Error(err);
    process.exit(1);
  }
  data.addData();
};

var app = express();

app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    ); //sending to secure
  }
});

// view engine setup
/* May be necessary */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//Bunch'a middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter); //Might have to be users not usersRouter

app.use(express.static(path.join(__dirname, "public"))); //sends static server (assets?) from public folder

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);
app.use("/favorites", favoriteRouter);
app.use("/comments", commentRouter);

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
  res.send({ error: err.message });
  // res.render("error");
});

module.exports = app;

start();
