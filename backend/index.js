import "dotenv/config";

import express from "express";
import cors from "cors";
import api from "./routes/indexRoutes.js"; // Imports your main router

const app = express();

// --- Configuração de CORS para Produção (Vercel e Render) ---

// NOVO: Adicione o localhost para desenvolvimento e simplifique o Vercel.
const allowedOrigins = [
  "http://localhost:3000", // Para desenvolvimento local
  "http://localhost:5173", // Para desenvolvimento local
  "https://patient-flow.vercel.app", // Domínio principal
  "https://www.controlesessoes.com.br",
  "https://controlesessoes.com.br",
  "https://patient-flow.onrender.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // 1. Verifica se a URL é exatamente um dos domínios principais na lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // 2. ADICIONE ESSA VERIFICAÇÃO: Permite qualquer subdomínio de patient-flow...vercel.app
    // Isso cobre todos os seus domínios de PR e preview que mudam (como *-loepldp72-*)
    if (origin.endsWith(".vercel.app") && origin.includes("patient-flow")) {
      return callback(null, true);
    }

    // Se a origem não for permitida, rejeita
    callback(new Error("Not allowed by CORS"));
  },
};
// --- Middleware ---
// Aplica a nova configuração de CORS
app.use(cors(corsOptions));

app.use(express.json()); // Parse JSON request bodies

// --- Routes ---
app.use("/api", api);

// --- Server Startup ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
