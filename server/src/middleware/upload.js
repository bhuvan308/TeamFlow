const multer = require('multer');
const env = require('../config/env');
const { ApiError } = require('./errorHandler');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
});

// Wraps multer's single-file middleware to turn its errors into ApiError
// so they flow through the same error-handling shape as the rest of the API.
function singleFileUpload(fieldName = 'file') {
  const mw = upload.single(fieldName);
  return function (req, res, next) {
    mw(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(new ApiError(400, `Upload error: ${err.message}`));
      }
      if (err) return next(err);
      if (!req.file) return next(new ApiError(400, 'No file provided'));
      next();
    });
  };
}

module.exports = { singleFileUpload };
