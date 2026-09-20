import type { Request, Response } from "express";
import {
  registerUser,
  updateUserProfile,
} from "../services/user.service.js";

export const handlerCreateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await registerUser(
    req.body.email,
    req.body.password,
  );

  res.status(201).json(user);
};

export const handlerUpdateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = res.locals.userId;

  const user = await updateUserProfile(
    userId,
    req.body.email,
    req.body.password,
  );

  res.status(200).json(user);
};