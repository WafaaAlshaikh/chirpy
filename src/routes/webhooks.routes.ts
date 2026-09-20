import { Router } from "express";
import { handlerPolkaWebhooks } from "../controllers/webhooks.controller.js";

const router = Router();

router.post("/webhooks", handlerPolkaWebhooks);

export default router;