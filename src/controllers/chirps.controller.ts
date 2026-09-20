import type { Request, Response } from "express";
import {
  createUserChirp,
  listChirps,
  getChirpById,
  deleteUserChirp,
} from "../services/chirp.service.js";

export const handlerCreateChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = res.locals.userId;

  const chirp = await createUserChirp(
    req.body.body,
    userId,
  );

  res.status(201).json(chirp);
};

export const handlerGetChirps = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authorId = req.query.authorId as string | undefined;
  const sort = req.query.sort as string | undefined;

  const chirps = await listChirps(authorId, sort);

  res.status(200).json(chirps);
};

export const handlerGetChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const chirp = await getChirpById(
    req.params.chirpId as string,
  );

  res.status(200).json(chirp);
};

export const handlerDeleteChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = res.locals.userId;

  await deleteUserChirp(
    req.params.chirpId as string,
    userId,
  );

  res.status(204).send();
};