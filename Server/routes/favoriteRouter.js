const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorite");
const e = require("express");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: mongoose.Types.ObjectId(req.user._id) })
      .populate("user dishes")
      .then(
        (fav) => {
          if (fav != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(fav);
          } else {
            // err = new Error('No existing Favorites');
            // err.status = 404;
            // return next(err);
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.json("No Existing Favorites");
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: mongoose.Types.ObjectId(req.user._id) }).then(
      (fav) => {
        if (fav != null) {
          for (i in req.body) {
            if (!fav.dishes.includes(req.body[i]._id)) {
              fav.dishes.push(req.body[i]);
            }
          }
          fav.save().then(
            (fav) => {
              Favorites.findById(fav._id)
                .populate("user dishes")
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            },
            (err) => next(err)
          );
        } else {
          const fav = {
            user: mongoose.Types.ObjectId(req.user._id),
            dishes: req.body,
          };
          Favorites.create(fav)
            .then(
              (fav) => {
                Favorites.findById(fav._id)
                  .populate("user dishes")
                  .then((fav) => {
                    //   console.log("Favorites Created ", fav);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(fav);
                  });
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        }
      }
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({ user: mongoose.Types.ObjectId(req.user._id) })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });
favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: mongoose.Types.ObjectId(req.user._id) })
      .then(
        (favorites) => {
          //   console.log(favorites.dishes);
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exits: false, favorites: favorites });
          } else {
            if (
              favorites.dishes.indexOf(
                mongoose.Types.ObjectId(req.params.dishId)
              ) < 0
            ) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: mongoose.Types.ObjectId(req.user._id) })
      .then(
        (usrfav) => {
          if (
            usrfav !== null &&
            usrfav.dishes.indexOf(mongoose.Types.ObjectId(req.params.dishId)) ==
              -1
          ) {
            // usrfav.dishes.push(mongoose.Types.ObjectId(req.params.dishId));
            usrfav.dishes = usrfav.dishes.concat([req.params.dishId]);
            usrfav.save().then(
              (dish) => {
                Favorites.findById(dish._id)
                  .populate("user dish")
                  .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(fav);
                  });
              },
              (err) => next(err)
            );
          } else if (
            usrfav !== null &&
            usrfav.dishes.indexOf(
              mongoose.Types.ObjectId(req.params.dishId)
            ) !== -1
          ) {
            res.setHeader("Content-Type", "plain/text");
            res.end("This dish already exists");
          } else {
            const fav = {
              user: req.user._id,
              dishes: [req.params.dishId],
            };
            Favorites.create(fav)
              .then(
                (fav) => {
                  Favorites.findById(fav._id)
                    .populate("user dishes")
                    .then((fav) => {
                      //   console.log("Favorites Created ", fav);
                      res.statusCode = 201;
                      res.setHeader("Content-Type", "application/json");
                      res.json(fav);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
            // err = new Error("No existing Favorites");
            // err.status = 404;
            // return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported in /favorites/${mongoose.Types.ObjectId(
        req.params.dishId
      )}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: mongoose.Types.ObjectId(req.user._id) })
      .then(
        (usrfav) => {
          if (
            usrfav != null &&
            usrfav.dishes.indexOf(
              mongoose.Types.ObjectId(req.params.dishId)
            ) !== -1
          ) {
            usrfav.dishes = usrfav.dishes.filter(
              (id) => id != req.params.dishId
            );
            usrfav.save().then(
              (fav) => {
                Favorites.findById(fav._id)
                  .populate("user dishes")
                  .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(fav);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(
              "Dish " +
                mongoose.Types.ObjectId(req.params.dishId) +
                " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
