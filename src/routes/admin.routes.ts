import { Router } from "express";
import {
  handlerMetrics,
  handlerReset,
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/metrics", handlerMetrics);
router.post("/reset", handlerReset);

export default router;