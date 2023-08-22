const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// const fileFilter = function (req, file, cb) {
//   const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
//       ),
//       false
//     );
//   }
// };

//allows files of any types
const fileFilter = function (req, file, cb) {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1000, // 1gb
  },
  fileFilter: fileFilter,
}).fields([{ name: "image", maxCount: 1 }]);

module.exports = upload;