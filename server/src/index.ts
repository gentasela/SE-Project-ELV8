import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authMiddleware } from "./middleware/auth";
import authRouter from "./routes/auth";
import plansRouter from "./routes/plans";
import progressRouter from "./routes/progress";
import fridgeRouter from "./routes/fridge";
import groceryRouter from "./routes/grocery";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration (mainly for development flexibility)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Custom auth middleware to check for session tokens on every request
app.use(authMiddleware);

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/plans", plansRouter);
app.use("/api/progress", progressRouter);
app.use("/api/fridge", fridgeRouter);
app.use("/api/grocery", groceryRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Server Error]", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[Server] ELV8 backend running on http://localhost:${PORT}`);
});
