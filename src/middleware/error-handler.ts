import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/http-errors.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log(err);

  if (err instanceof BadRequestError) {
    res.status(400).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(401).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
    });
    return;
  }

  res.status(500).json({
    error: "Something went wrong on our end",
  });
};