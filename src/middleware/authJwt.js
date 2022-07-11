const jwt = require("jsonwebtoken");
const config = require("../config/auth");
const { sendResponse } = require("../services/helper");

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return sendResponse(res, 401, "Unauthorized !");
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return sendResponse(res, 403, "Failed to authenticate token.", err);
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = {
  verifyToken,
};
