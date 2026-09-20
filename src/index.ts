import express from "express";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { config } from "./config.js";
import { db } from "./db/index.js";

import { errorHandler } from "./middleware/error-handler.js";
import { middlewareLogResponses } from "./middleware/logging.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";

import chirpsRouter from "./routes/chirps.routes.js";
import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import adminRouter from "./routes/admin.routes.js";
import webhooksRouter from "./routes/webhooks.routes.js";

await migrate(db, config.db.migrationConfig);

const app = express();

app.use(express.json());

app.use(middlewareLogResponses);

app.get("/healthz", (req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
});

app.use("/api/chirps", chirpsRouter);
app.use("/api", authRouter);
app.use("/api", usersRouter);
app.use("/admin", adminRouter);
app.use("/api/polka", webhooksRouter);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(errorHandler);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});