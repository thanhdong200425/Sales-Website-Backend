import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.send("Sales Website Backend is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
