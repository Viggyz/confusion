const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Comment = require("../models/comments");

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    // Comment.findById(req.query)
    Comment.find({})
      .populate("author")
      .then(
        (comments) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comments);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
      req.body = {
        author: req.user._id,
        dish: mongoose.Types.ObjectId(req.body.dish),
        rating: parseInt(req.body.rating),
        comment: req.body.comment,
      };
      Comment.create(req.body)
        .then(
          (comment) => {
            Comment.findById(comment._id)
              .populate("author")
              .then((comments) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(comments);
              });
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      err = new Error("Comment not found in request body");
      err.status = 404;
      return next(err);
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /comments/");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Comment.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
commentRouter
  .route("/:commentId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Comment.findById(req.params.commentId)
      .populate("author")
      .then(
        (comment) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comment);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported in /comments/" + req.params.commentId
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comment.findById(req.params.commentId)
      .then(
        (comment) => {
          if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
              err = new Error("You are not authorised to update this comment!");
              err.status = 403;
              return next(err);
            }
            req.body.author = req.user._id;
            Comment.findByIdAndUpdate(
              req.params.commentId,
              {
                $set: req.body,
              },
              { new: true }
            ) //New returns the comment in then
              .then(
                (comment) => {
                  Comment.findById(comment._id)
                    .populate("author")
                    .then((comment) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(comment);
                    });
                },
                (err) => next(err)
              );
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comment.findById(req.params.commentId)
      .then(
        (comment) => {
          if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
              err = new Error("You are not authorised to delete this comment!");
              err.status = 403;
              return next(err);
            }
            Comment.findByIdAndRemove(req.params.commentId)
              .then(
                (comment) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(resp);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = commentRouter;
