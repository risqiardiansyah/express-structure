const middleware = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = (app) => {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/register",
    [controller.validate("register"), middleware.isUserExist],
    controller.register
  );
  app.post("/api/auth/login", controller.validate("login"), controller.login);
  app.get(
    "/api/auth/check/token",
    middleware.verifyToken,
    controller.checkToken
  );
};
