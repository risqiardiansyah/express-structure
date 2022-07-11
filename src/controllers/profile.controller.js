const db = require("../models");
const User = db.user;

exports.profile = (req, res) => {
  User.findByPk(req.userId)
    .then((user) => {
      const resp = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      };
      return sendResponse(res, 200, "User found", resp);
    })
    .catch((err) => {
      return sendResponse(res, 500, "Error finding user", err);
    });
};
