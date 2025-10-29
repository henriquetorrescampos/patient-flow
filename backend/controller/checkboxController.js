import * as checkboxService from "../service/checkboxService.js";

//
// THIS FUNCTION IS MISSING
//
export const httpGetPatientCheckboxes = async (req, res) => {
  try {
    const { patientId } = req.params;
    const checkboxes = await checkboxService.getCheckboxesForPatient(patientId);
    res.status(200).json(checkboxes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get patient checkboxes" });
  }
};

//
// THIS FUNCTION IS ALSO MISSING (but your routes use it)
//
export const httpUpdatePatientCheckbox = async (req, res) => {
  try {
    const { patientId } = req.params;
    // Body needs: { "area": "FONO", "checkboxNumber": 3, "isChecked": true }
    const { area, checkboxNumber, isChecked } = req.body;

    if (
      area === undefined ||
      checkboxNumber === undefined ||
      isChecked === undefined
    ) {
      return res
        .status(400)
        .json({
          error: "Missing required fields: area, checkboxNumber, isChecked",
        });
    }

    const updatedCheckbox = await checkboxService.updateCheckbox(
      patientId,
      area,
      checkboxNumber,
      isChecked
    );
    res.status(200).json(updatedCheckbox);
  } catch (error) {
    console.error(error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update checkbox" });
  }
};

/**
 * NEW CONTROLLER: Adds 8 checkboxes for a new area to a patient.
 * (This is your existing, correct function)
 */
export const httpAddAreaToPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { area } = req.body; // Expecting a body like { "area": "PSICO" }

    if (!area) {
      return res.status(400).json({ error: "Missing required field: area" });
    }

    const newCheckboxes = await checkboxService.addAreaToPatient(
      patientId,
      area
    );
    res.status(201).json(newCheckboxes);
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("Invalid area type") ||
      error.message.includes("already has checkboxes")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to add area to patient" });
  }
};
