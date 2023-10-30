import { RequestHandler } from "express";
import { ZodError } from "zod";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body) {
      return res.status(422).json({ error: "empty body is kinda unexpected. what r u trying to do?" })
    }

    try {
      schema.parse({ body: req.body });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({ errors: formattedErrors });
      }
      return res.status(500).json({ error: `There was an error: ${error}` })
    }
  }
}
