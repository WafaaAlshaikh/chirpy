import type { NextFunction, Request, Response } from "express";

import { config } from "../config.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { UnauthorizedError } from "../errors/http-errors.js";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);

    res.locals.userId = userId;

    next();
  } catch {
    next(new UnauthorizedError("Invalid token"));
  }
};