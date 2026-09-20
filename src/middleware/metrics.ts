import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  config.api.fileserverHits++;
  next();
};