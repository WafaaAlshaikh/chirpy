import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "../errors/http-errors.js";

export const handlerMetrics = (
  req: Request,
  res: Response,
): void => {
  res.set("Content-Type", "text/html; charset=utf-8");

  res.send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileserverHits} times.</p>
      </body>
    </html>
  `);
};

export const handlerReset = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError("Forbidden");
  }

  config.api.fileserverHits = 0;

  await deleteAllUsers();

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
};