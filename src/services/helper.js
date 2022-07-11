const fs = require("fs");

const sendResponse = (res, status, msg, data = []) => {
  res.status(status).json({
    status,
    msg,
    data,
  });
};

const checkStorage = (folder) => {
  var dir = "./storage/" + folder;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const uploadFiles = (base64, folder) => {
  if (Array.isArray(base64)) {
    let images = base64.map((item) => {
      checkStorage(folder);

      const filename = Date.now() + ".png";
      const path = "./storage/" + folder + "/" + filename;

      const base64Data = item.replace(/^data:([A-Za-z-+/]+);base64,/, "");
      fs.writeFileSync(path, base64Data, { encoding: "base64" });

      const image = {};
      image.file = filename;

      return image;
    });

    return images;
  } else {
    checkStorage(folder);

    const filename = Date.now() + ".png";
    const path = "./storage/" + folder + "/" + filename;

    const base64Data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    fs.writeFileSync(path, base64Data, { encoding: "base64" });

    const image = {};
    image.file = filename;

    return image;
  }
};

module.exports = { sendResponse, uploadFiles };
