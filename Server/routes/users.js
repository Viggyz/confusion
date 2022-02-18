var express = require("express");
const bodyParser = require("body-parser");
var passport = require("passport");
var User = require("../models/user");
//var authenticate = require('../authenticate');
const authenticate = require("../authenticate");
const cors = require("./cors");
const config = require("../config");

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options("*", cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});
router.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function (req, res, next) {
    User.find({})
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.json({
                success: false,
                status: "Registration Unsuccessful!",
                err: info,
              });
            }
            const tokenData = authenticate.getToken({ _id: user._id });
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              status: "Registration Successful!",
              token: tokenData.token,
              user: {
                id: user._id,
                username: user.username,
                admin: user.admin,
                fname: user.firstname,
                lname: user.lastname,
              },
              expiresAt: tokenData.expiresIn,
            });
          })(req, res, next);
        });
      }
    }
  );
});

router.post("/login", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "Login Unsuccessful!", err: info });
    }
    const tokenData = authenticate.getToken({ _id: user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      status: "Login Successful!",
      token: tokenData.token,
      user: {
        id: user._id,
        username: user.username,
        admin: user.admin,
        fname: user.firstname,
        lname: user.lastname,
      },
      expiresAt: tokenData.expiresIn,
    });
    // });
  })(req, res, next);
});

// router.get("/logout", (req, res, next) => {
//   if (req.session) {
//     req.session.destroy();
//     res.clearCookie("session-id");
//     res.redirect("/");
//   } else {
//     var err = new Error("You are not logged in!");
//     err.status = 403;
//     next(err);
//   }
// });

router.get("/checkJWTToken", cors.corsWithOptions, (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid", success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid", success: true, user: user });
    }
  })(req, res);
});

module.exports = router;
