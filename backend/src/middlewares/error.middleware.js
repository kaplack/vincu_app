const { HttpError } = require("../utils/httpError");

function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: "Not Found", path: req.originalUrl });
}

function errorHandler(err, _req, res, _next) {
  if (err && err.name === "ValidationError") {
    return res.status(err.status || 400).json({
      message: err.message || "Invalid request.",
      code: err.code || "VALIDATION_ERROR",
      details: err.details ?? undefined,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details ?? undefined,
    });
  }

  if (err && err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Unique constraint error.",
      code: "DB_UNIQUE_CONSTRAINT",
      details: err.errors?.map((e) => ({ field: e.path, message: e.message })) ?? undefined,
    });
  }

  console.error(err);
  res.status(500).json({ message: "Internal Server Error", code: "INTERNAL_ERROR" });
}

module.exports = { notFoundHandler, errorHandler };
