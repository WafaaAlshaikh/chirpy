import express, { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

const app = express();
const PORT = 8080;

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
  config.fileserverHits++;
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
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>
`);
};

const handlerReset = (req: Request, res: Response): void => {
  config.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
};

const handlerValidateChirp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  type Parameters = {
    body: string;
  };

  const params: Parameters = req.body;

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

  res.status(200).json({
    cleanedBody: cleanedBody,
  });
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

  res.status(500).json({
    error: "Something went wrong on our end",
  });
};

app.use(middlewareLogResponses);

app.get("/healthz", handlerReadiness);

app.post("/api/validate_chirp", handlerValidateChirp);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
