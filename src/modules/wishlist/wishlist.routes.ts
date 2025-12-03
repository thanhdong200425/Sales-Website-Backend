import { Router } from "express";
import { toggleWishlist, getWishlist } from "./wishlist.controller";

const router = Router();

router.post("/toggle", toggleWishlist);

router.get("/:userId", getWishlist);

export default router;