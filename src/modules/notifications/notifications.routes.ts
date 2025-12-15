import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  getList,
  setRead,
  setUnread,
  setAllRead,
  getDetail,
} from "./notifications.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getList);
router.get("/:id", getDetail);
router.patch("/:id/read", setRead);
router.patch("/:id/unread", setUnread);
router.post("/mark-all-read", setAllRead);

export default router;

