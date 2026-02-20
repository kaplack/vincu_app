// backend/src/middlewares/validate.middleware.js

/**
 * Validate request body using Zod schema
 */
function validateBody(schema) {
  return (req, _res, next) => {
    console.log("Validating request body:", req.body);

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next({
        name: "ValidationError",
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request body.",
        details: parsed.error.flatten(),
      });
    }

    req.body = parsed.data;
    next();
  };
}

/**
 * Validate request params using Zod schema
 */
function validateParams(schema) {
  return (req, _res, next) => {
    console.log("Validating request params:", req.params);

    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next({
        name: "ValidationError",
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request params.",
        details: parsed.error.flatten(),
      });
    }

    req.params = parsed.data;
    next();
  };
}

/**
 * Validate request query using Zod schema
 */
function validateQuery(schema) {
  return (req, _res, next) => {
    console.log("Validating request query:", req.query);

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next({
        name: "ValidationError",
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request query.",
        details: parsed.error.flatten(),
      });
    }

    req.query = parsed.data;
    next();
  };
}

/**
 * Validate body + params + query in a single schema
 * Schema shape:
 * {
 *   body?: zodSchema,
 *   params?: zodSchema,
 *   query?: zodSchema
 * }
 */
function validate(schema) {
  return (req, _res, next) => {
    console.log("Validating request (body, params, query)");

    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      return next({
        name: "ValidationError",
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request data.",
        details: parsed.error.flatten(),
      });
    }

    // Re-assign sanitized values if present
    if (parsed.data.body !== undefined) {
      req.body = parsed.data.body;
    }
    if (parsed.data.params !== undefined) {
      req.params = parsed.data.params;
    }
    if (parsed.data.query !== undefined) {
      req.query = parsed.data.query;
    }

    next();
  };
}

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  validate, // 👈 nuevo wrapper
};
