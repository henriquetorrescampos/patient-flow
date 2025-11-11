import { Router } from "express";
import patientRouter from "./patientRoutes.js";
import historyRoutes from "./historyRoutes.js";

const api = Router();

// Monta as rotas de pacientes/checkboxes em /api/patients
api.use("/patients", patientRouter);

// Monta as rotas de histórico em /api/history
api.use("/history", historyRoutes);

export default api;
