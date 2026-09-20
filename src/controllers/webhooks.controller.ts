import type { Request, Response } from "express";
import { config } from "../config.js";
import { getAPIKey } from "../auth.js";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import {
  NotFoundError,
  UnauthorizedError,
} from "../errors/http-errors.js";

type PolkaWebhook = {
  event: string;
  data: {
    userId: string;
  };
};

export const handlerPolkaWebhooks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let apiKey: string;

  try {
    apiKey = getAPIKey(req);
  } catch {
    throw new UnauthorizedError("Invalid API key");
  }

  if (apiKey !== config.api.polkaKey) {
    throw new UnauthorizedError("Invalid API key");
  }

  const params: PolkaWebhook = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const user = await upgradeUserToChirpyRed(params.data.userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(204).send();
};