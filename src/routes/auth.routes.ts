import { Router } from "express";
import {
  handlerLogin,
  handlerRefresh,
  handlerRevoke,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", handlerLogin);
router.post("/refresh", handlerRefresh);
router.post("/revoke", handlerRevoke);

export default router;