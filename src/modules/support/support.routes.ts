import { Router } from "express";
import { createContactRequest, createChatMessage } from "./support.controller";

const router = Router();

router.post("/contact", createContactRequest);
router.post("/chat", createChatMessage);

export default router;


