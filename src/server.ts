import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/orders.routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (_req, res) => {
    res.send("Sales Website Backend is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
