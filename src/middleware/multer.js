const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // 1 mega == 1000000 byte
  },
  fileFilter(req, file, cb) {
    // Regx for word document = /\.(doc|docx)$/
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|docx)$/)) {
      return cb(new Error("Please upload a Image only"));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
