const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//allows files of any types
const fileFilter = function (req, file, cb) {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1000, // 1gb size limit for upload
  },
  fileFilter: fileFilter,
}).fields([{ name: "image", maxCount: 1 }]);

module.exports = upload;