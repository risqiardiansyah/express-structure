const config = require("../config/auth");
const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator/check");
const { sendResponse } = require("../services/helper");

exports.validate = (method) => {
  switch (method) {
    case "login":
      return [
        body("email").isEmail().withMessage("Email is required"),
        body("password")
          .isLength({ min: 5 })
          .withMessage("Password is required"),
      ];
    case "register":
      return [
        body("name").isLength({ min: 5 }).withMessage("Name is required"),
        body("phone").isLength({ min: 5 }).withMessage("Phone is required"),
        body("email").isEmail().withMessage("Email is required"),
        body("email").custom((value, { req }) => {
          return User.findOne({
            where: {
              email: value,
            },
          }).then((user) => {
            if (user) {
              return Promise.reject("Email is already exists!");
            }
          });
        }),
        body("password")
          .isLength({ min: 5 })
          .withMessage("Password is required"),
      ];
    default:
      return [];
  }
};

exports.register = (req, res) => {
  // BECAUSE REGISTER HAS ANOTHER MIDDLEWARE, SO WE DONT NEED TO VALIDATE HERE

  User.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then((user) => {
      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, //24
      });

      let resp = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accessToken: token,
      };

      return sendResponse(res, 200, "User created successfully", resp);
    })
    .catch((err) => {
      return sendResponse(res, 500, "Error creating user", err);
    });
};

exports.login = (req, res) => {
  // BECAUSE LOGIN HAS NOT MIDDLEWARE, SO WE NEED TO VALIDATE HERE

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, "Params not complete !", errors.array());
  }

  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return sendResponse(res, 404, "User not found");
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return sendResponse(res, 401, "Invalid password");
      }

      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, //24
      });

      const resp = {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken: token,
      };
      return sendResponse(res, 200, "User logged in successfully", resp);
    })
    .catch((err) => {
      return sendResponse(res, 500, "Error logging in user", err);
    });
};

exports.checkToken = (req, res) => {
  let userId = req.userId;
  User.findOne({
    where: {
      id: userId,
    },
  }).then((user) => {
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }
    const resp = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    };
    return sendResponse(res, 200, "User found", resp);
  });
};
