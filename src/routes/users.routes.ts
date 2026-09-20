import { Router } from "express";
import {
  handlerCreateUser,
  handlerUpdateUser,
} from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/users", handlerCreateUser);
router.put("/users", requireAuth, handlerUpdateUser);

export default router;