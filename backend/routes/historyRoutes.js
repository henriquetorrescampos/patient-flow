// historyRoutes.js
import { Router } from "express";
import * as historyController from "../controller/historyController.js";

const router = Router();

// As rotas aqui são relativas a /api/history

// POST /api/history
router.post("/", historyController.saveHistory);

// GET /api/history/:patientId
router.get("/:patientId", historyController.getPatientHistory);

// GET /api/history/:patientId/area/:area
router.get("/:patientId/area/:area", historyController.getAreaHistory);

// DELETE /api/history/:historyId
router.delete("/:historyId", historyController.deleteHistory);

export default router;
