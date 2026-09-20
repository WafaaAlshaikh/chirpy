import { Router } from "express";
import {
  handlerCreateChirp,
  handlerGetChirps,
  handlerGetChirp,
  handlerDeleteChirp,
} from "../controllers/chirps.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, handlerCreateChirp);
router.get("/", handlerGetChirps);
router.get("/:chirpId", handlerGetChirp);
router.delete("/:chirpId", requireAuth, handlerDeleteChirp);

export default router;