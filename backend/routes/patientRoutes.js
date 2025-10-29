import { Router } from "express";
import * as patientController from "../controller/patientController.js";
import * as checkboxController from "../controller/checkboxController.js";

const router = Router();

// GET a single patient by ID
// GET /api/patients/123
router.get("/:id", patientController.httpGetPatientById);

// GET all patients
router.get("/", patientController.httpGetAllPatients);


// Create a new patient (and optionally, their initial areas)
// POST /api/patients
// Body: { "name": "...", "areas": ["FONO", "TO"] }
router.post("/", patientController.httpCreatePatient);

// --- Checkbox Routes ---

// Get all checkboxes for a specific patient
// GET /api/patients/123/checkboxes
router.get(
  "/:patientId/checkboxes",
  checkboxController.httpGetPatientCheckboxes
);

// Add a new area (8 checkboxes) to a patient
// POST /api/patients/123/checkboxes/area
// Body: { "area": "PSICO" }
router.post(
  "/:patientId/checkboxes/area",
  checkboxController.httpAddAreaToPatient
);

// Update a single checkbox for a specific patient
// PATCH /api/patients/123/checkboxes
// Body: { "area": "FONO", "checkboxNumber": 3, "isChecked": true }
router.patch(
  "/:patientId/checkboxes",
  checkboxController.httpUpdatePatientCheckbox
);

export default router;
