import { Router } from "express";
import patientRouter from "./patientRoutes.js";

const api = Router();

api.use("/patients", patientRouter);
// You could add other routes here later, e.g., api.use('/users', ...)

export default api;
