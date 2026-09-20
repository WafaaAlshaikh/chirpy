import type { Request, Response } from "express";
import { getBearerToken } from "../auth.js";
import {
  loginUser,
  refreshAccessToken,
  revokeUserRefreshToken,
} from "../services/auth.service.js";
import { UnauthorizedError } from "../errors/http-errors.js";

export const handlerLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await loginUser(
    req.body.email,
    req.body.password,
  );

  res.status(200).json(result);
};

export const handlerRefresh = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let token: string;

  try {
    token = getBearerToken(req);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const accessToken = await refreshAccessToken(token);

  res.status(200).json({
    token: accessToken,
  });
};

export const handlerRevoke = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let token: string;

  try {
    token = getBearerToken(req);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  await revokeUserRefreshToken(token);

  res.status(204).send();
};