const fs = require("fs");
const { uploadFile, __basedir } = require("../services/upload");
const db = require("../models");
const { sendResponse, uploadFiles } = require("../services/helper");
const { body, validationResult } = require("express-validator/check");
const Image = db.image;
const Product = db.product;

exports.validate = (method) => {
  switch (method) {
    case "upload":
      return [
        body("product_id")
          .isNumeric()
          .withMessage("Product ID harus berupa angka"),
        body("product_id").custom((value) => {
          return Product.findByPk(value).then((product) => {
            if (!product) {
              return Promise.reject("Product not found!");
            }
          });
        }),
        body("files").not().isEmpty().withMessage("File harus berupa file"),
        body("files").isArray().withMessage("File harus array"),
      ];

    default:
      break;
  }
};

exports.upload = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, "Params not complete !", errors.array());
  }

  try {
    const id = req.body.product_id;
    const imgdata = req.body.files;

    let images = uploadFiles(imgdata, "product");
    for (let i = 0; i < images.length; i++) {
      images[i].product_id = id;
    }

    Image.bulkCreate(images)
      .then((result) => {
        return sendResponse(res, 200, "Image was uploaded successfully!");
      })
      .catch((err) => {
        return sendResponse(res, 500, "Uploaded files failed", err.message);
      });
  } catch (e) {
    console.log(e);
    return sendResponse(res, 500, "Error", e);
  }
};

exports.remove = (req, res) => {
  const id = req.params.id;

  Image.findByPk(id)
    .then((data) => {
      fs.unlink(__basedir + `/storage/upload/${data.file}`, function (err) {
        if (err) {
          throw sendResponse(res, 500, "delete Image failed", err);
        }

        Image.destroy({
          where: {
            id: id,
          },
        })
          .then((num) => {
            if (num == 1) {
              return sendResponse(res, 200, "Image was deleted successfully!");
            } else {
              return sendResponse(
                res,
                500,
                'Cannot delete image with id "' + id + '"'
              );
            }
          })
          .catch((err) => {
            return sendResponse(res, 500, "Error", err);
          });
      });
    })
    .catch((err) => {
      return sendResponse(res, 500, "Error", err);
    });
};
