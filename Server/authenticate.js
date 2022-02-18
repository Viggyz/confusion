var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");

var config = require("./config");
const { NotExtended } = require("http-errors");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  const iat = Date.now();
  const token = jwt.sign({ _id: user._id, iat: iat }, config.secretKey, {
    expiresIn: config.expiresIn,
  });
  return {
    token: "Bearer " + token,
    expiresIn: iat + config.expiresIn,
  };
};

var opts = {}; //Options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //gets token from header
opts.secretOrKey = config.secretKey; //Applies secret key

exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts, //Applies jwt strategy ,uses done to pass info to req
    (jwt_payload, done) => {
      // console.log("JWT payload: ", jwt_payload);
      User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
          return done(err, false);
        } else if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);

exports.verifyUser = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      next(info);
    } else {
      req.user = user;
      next();
    }
  })(req, res);
};
exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin == true) return next();
  else {
    err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  }
};
