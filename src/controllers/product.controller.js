const db = require("../models");
const { sendResponse } = require("../services/helper");
const { getPagination, getPagingData } = require("../services/pagination");
const { body, validationResult } = require("express-validator/check");
const Product = db.product;
const Image = db.image;
const Category = db.category;

exports.validate = (method) => {
  switch (method) {
    case "create":
      return [
        body("category_id").custom((value, { req }) => {
          return Category.findOne({
            where: {
              id: value,
            },
          }).then((cat) => {
            if (!cat) {
              return Promise.reject("Kategori tidak ditemukan!");
            }
          });
        }),
        body("title").not().isEmpty().withMessage("Title harus diisi"),
        body("brand").not().isEmpty().withMessage("Brand harus diisi"),
        body("model").not().isEmpty().withMessage("Model harus diisi"),
        body("year").not().isEmpty().withMessage("Tahun harus diisi"),
        body("condition").not().isEmpty().withMessage("Kondisi harus diisi"),
        body("condition").isBoolean().withMessage("Kondisi harus 0 atau 1"),
        body("price").not().isEmpty().withMessage("Price harus diisi"),
        body("price").isNumeric().withMessage("Price harus berupa angka"),
        body("description")
          .not()
          .isEmpty()
          .withMessage("Description harus diisi"),
        body("address").not().isEmpty().withMessage("Address harus diisi"),
        body("sold").not().isEmpty().withMessage("Sold harus diisi"),
      ];
    case "edit":
      return [
        body("category_id").custom((value, { req }) => {
          return Category.findOne({
            where: {
              id: value,
            },
          }).then((cat) => {
            if (!cat) {
              return Promise.reject("Kategori tidak ditemukan!");
            }
          });
        }),
        body("id").not().isEmpty().withMessage("ID Produk harus diisi"),
        body("title").not().isEmpty().withMessage("Title harus diisi"),
        body("brand").not().isEmpty().withMessage("Brand harus diisi"),
        body("model").not().isEmpty().withMessage("Model harus diisi"),
        body("year").not().isEmpty().withMessage("Tahun harus diisi"),
        body("condition").not().isEmpty().withMessage("Kondisi harus diisi"),
        body("condition").isBoolean().withMessage("Kondisi harus 0 atau 1"),
        body("price").not().isEmpty().withMessage("Price harus diisi"),
        body("price").isNumeric().withMessage("Price harus berupa angka"),
        body("description")
          .not()
          .isEmpty()
          .withMessage("Description harus diisi"),
        body("address").not().isEmpty().withMessage("Address harus diisi"),
        body("sold").not().isEmpty().withMessage("Sold harus diisi"),
      ];
    default:
      break;
  }
};

exports.index = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Product.findAndCountAll({
    where: {
      user_id: req.userId,
    },
    limit,
    offset,
    include: Image,
  })
    .then((result) => {
      const response = getPagingData(result, page, limit);
      return sendResponse(res, 200, "product list", response);
    })
    .catch((err) => {
      console.log(err);
      return sendResponse(res, 500, "error", err);
    });
};

exports.create = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Params not complete", errors.array());
  }

  const product = {
    user_id: req.userId,
    ...req.body,
  };

  Product.create(product)
    .then((result) => {
      return sendResponse(res, 201, "product created", result);
    })
    .catch((err) => {
      return sendResponse(res, 500, "error", err);
    });
};

exports.show = (req, res) => {
  const id = req.params.id;

  Product.findByPk(id, {
    include: Image,
  })
    .then((result) => {
      if (result.user_id != req.userId) {
        return sendResponse(res, 401, "unauthorized data product");
      }

      return sendResponse(res, 200, "product detail", result);
    })
    .catch((err) => {
      return sendResponse(res, 500, "error", err);
    });
};

exports.update = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Params not complete", errors.array());
  }

  const id = req.body.id;

  Product.findByPk(id)
    .then((result) => {
      if (result.user_id != req.userId) {
        return sendResponse(res, 401, "unauthorized data product");
      }

      Product.update(req.body, {
        where: {
          id: id,
        },
      })
        .then((num) => {
          if (num == 1) {
            return sendResponse(res, 200, "product updated");
          } else {
            return sendResponse(res, 404, "product not found");
          }
        })
        .catch((err) => {
          console.log(err.message);
          return sendResponse(res, 500, "errorr", err);
        });
    })
    .catch((err) => {
      return sendResponse(res, 500, "error", err);
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Product.findByPk(id)
    .then((result) => {
      if (result.user_id != req.userId) {
        return sendResponse(res, 401, "unauthorized data product");
      }

      Product.destroy({
        where: {
          id: id,
        },
      })
        .then((num) => {
          if (num == 1) {
            return sendResponse(res, 200, "product deleted");
          } else {
            res.status(400).json({
              message: `cannot delete product with id ${id}`,
            });
          }
        })
        .catch((err) => {
          return sendResponse(res, 500, "error", err);
        });
    })
    .catch((err) => {
      return sendResponse(res, 500, "error", err);
    });
};
