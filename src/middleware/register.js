const { validationResult } = require("express-validator/check");
const { sendResponse } = require("../services/helper");
const db = require("../models");
const User = db.user;

isUserExist = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, "Params not complete !", errors.array());
  }

  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      res.status(400).json({
        message: "email is already exists!",
      });
      return;
    }
    next();
  });
};

module.exports = {
  isUserExist,
};
