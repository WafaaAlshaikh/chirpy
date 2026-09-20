import express, { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteAllUsers, getUserByEmail, updateUser, upgradeUserToChirpyRed } from "./db/queries/users.js";
import { createChirp, getChirps, getChirp, deleteChirp, getChirpsByAuthor  } from "./db/queries/chirps.js";
import { hashPassword, checkPasswordHash, makeJWT, getBearerToken, validateJWT, makeRefreshToken, getAPIKey  } from "./auth.js";
import { createRefreshToken, getUserFromRefreshToken, revokeRefreshToken} from "./db/queries/refreshTokens.js";
const migrationClient = postgres(config.db.url, { max: 1 });

await migrate(
  drizzle(migrationClient),
  config.db.migrationConfig,
);

const app = express();
const PORT = config.api.port;

app.use(express.json());


class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode !== 200) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
};

const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  config.api.fileserverHits++;
  next();
};

const handlerReadiness = (req: Request, res: Response): void => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
};

const handlerMetrics = (req: Request, res: Response): void => {
  res.set("Content-Type", "text/html; charset=utf-8");

  res.send(`
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>
`);
};

const handlerReset = async (
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

const handlerCreateChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  type Parameters = {
    body: string;
  };

  const params: Parameters = req.body;
  let userId: string;

try {
  const token = getBearerToken(req);
  userId = validateJWT(token, config.api.jwtSecret);
} catch {
  throw new UnauthorizedError("Invalid token");
}

  if (params.body.length > 140) {
    throw new BadRequestError(
      "Chirp is too long. Max length is 140",
    );
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];

  const words = params.body.split(" ");

  const cleanedWords = words.map((word) => {
    if (profaneWords.includes(word.toLowerCase())) {
      return "****";
    }

    return word;
  });

  const cleanedBody = cleanedWords.join(" ");

  const chirp = await createChirp({
    body: cleanedBody,
    userId,
  });

  res.status(201).json(chirp);
};

const errorHandler = (
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

const handlerCreateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const hashedPassword = await hashPassword(req.body.password);

  const user = await createUser({
    email: req.body.email,
    hashedPassword: hashedPassword,
  });

  const { hashedPassword: _, ...userResponse } = user;

  res.status(201).json(userResponse);
};

const handlerGetChirps = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let authorId = "";
  const authorIdQuery = req.query.authorId;

  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }

  let chirps;

  if (authorId) {
    chirps = await getChirpsByAuthor(authorId);
  } else {
    chirps = await getChirps();
  }

  const sortQuery = req.query.sort;

  if (sortQuery === "desc") {
    chirps.sort(
      (a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } else {
    chirps.sort(
      (a, b) =>
        a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  res.status(200).json(chirps);
};

const handlerGetChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const chirp = await getChirp(req.params.chirpId as string);

  if (!chirp) {
    res.status(404).json({
      error: "Chirp not found",
    });
    return;
  }

  res.status(200).json(chirp);
};

const handlerLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await getUserByEmail(req.body.email);

  if (!user) {
    res.status(401).json({
      error: "incorrect email or password",
    });
    return;
  }

  const passwordMatch = await checkPasswordHash(
    req.body.password,
    user.hashedPassword,
  );

  if (!passwordMatch) {
    res.status(401).json({
      error: "incorrect email or password",
    });
    return;
  }

  const token = makeJWT(
  user.id,
  3600,
  config.api.jwtSecret,
);

const refreshToken = makeRefreshToken();
const expiresAt = new Date();

expiresAt.setDate(expiresAt.getDate() + 60);
await createRefreshToken({
  token: refreshToken,
  userId: user.id,
  expiresAt,
});

  const { hashedPassword: _, ...userResponse } = user;

  res.status(200).json({ ...userResponse, token, refreshToken });
};

const handlerRefresh = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let token: string;

  try {
    token = getBearerToken(req);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const refreshToken = await getUserFromRefreshToken(token);

  if (!refreshToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (refreshToken.revokedAt) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (refreshToken.expiresAt <= new Date()) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const accessToken = makeJWT(
    refreshToken.userId,
    3600,
    config.api.jwtSecret,
  );

  res.status(200).json({
    token: accessToken,
  });
};

const handlerRevoke = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let token: string;

  try {
    token = getBearerToken(req);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  await revokeRefreshToken(token);

  res.status(204).send();
};

const handlerUpdateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let userId: string;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid token");
  }

  const hashedPassword = await hashPassword(req.body.password);

  const user = await updateUser(
    userId,
    req.body.email,
    hashedPassword,
  );

  const { hashedPassword: _, ...userResponse } = user;

  res.status(200).json(userResponse);
};

const handlerDeleteChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let userId: string;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid token");
  }

  const chirp = await getChirp(req.params.chirpId as string);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  if (chirp.userId !== userId) {
    throw new ForbiddenError("Forbidden");
  }

  await deleteChirp(chirp.id);

  res.status(204).send();
};

type PolkaWebhook = {
  event: string;
  data: {
    userId: string;
  };
};

const handlerPolkaWebhooks = async (
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

app.use(middlewareLogResponses);

app.get("/healthz", handlerReadiness);

app.post("/api/chirps", handlerCreateChirp);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/users", handlerCreateUser);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);
app.put("/api/users", handlerUpdateUser);
app.delete("/api/chirps/:chirpId", handlerDeleteChirp);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.post("/api/polka/webhooks", handlerPolkaWebhooks);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
