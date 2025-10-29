import "dotenv/config";

import express from "express";
import cors from "cors";
import api from "./routes/indexRoutes.js"; // Imports your main router

const app = express();

// --- Configuração de CORS para Produção (Vercel e Render) ---

// 1. Defina o(s) domínio(s) permitido(s)
// Use o domínio principal do seu projeto no Vercel.
// O domínio foi inferido da sua imagem: patient-flow-git-main-henriquetcampos-projects.vercel.app
// É recomendável usar uma variável de ambiente, mas para o deploy inicial, podemos fixar.

const allowedOrigins = [
  // Domínio de Produção do Vercel
  "https://patient-flow-git-main-henriquetcampos-projects.vercel.app",
  // Domínio de PR/Preview do Vercel (opcional, mas recomendado)
  "https://patient-flow-qvezbxcikm-henriquetcampos-projects.vercel.app",
  // Se o Vercel tiver um domínio principal sem sufixo, adicione aqui (ex: patient-flow.vercel.app)
];

const corsOptions = {
  // A função de origem verifica se a requisição é permitida
  origin: (origin, callback) => {
    // Permite se não houver 'origin' (ex: requisições feitas pelo Backend para o próprio Backend, ou ferramentas como Postman)
    if (!origin) return callback(null, true);

    // Permite se o domínio estiver na lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Rejeita requisições de outros domínios
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// --- Middleware ---
// Aplica a nova configuração de CORS
app.use(cors(corsOptions));

app.use(express.json()); // Parse JSON request bodies

// --- Routes ---
// Connects your router file
app.use("/api", api);

// --- Server Startup ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
