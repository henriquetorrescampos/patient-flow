// Put this at the very top
import "dotenv/config";

import express from "express";
import cors from "cors";
import api from "./routes/indexRoutes.js"; // Imports your main router

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: "http://localhost:3000", // Assuming your React app runs on 3000
  })
);

app.use(express.json()); // Parse JSON request bodies

// --- Routes ---
// Connects your router file
app.use("/api", api);

// --- Server Startup ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
