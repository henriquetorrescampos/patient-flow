import { prisma } from "../lib/prisma.js";
import pkg from "@prisma/client";

const { AreaType } = pkg;

const CHECKBOX_COUNT = 8;

/**
 * Gets all checkboxes for a specific patient.
 */
export const getCheckboxesForPatient = async (patientId) => {
  return prisma.checkbox.findMany({
    where: {
      patientId: parseInt(patientId),
    },
    orderBy: [{ area: "asc" }, { checkboxNumber: "asc" }],
  });
};

/**
 * Updates the checked state of a single checkbox.
 */
export const updateCheckbox = async (
  patientId,
  area,
  checkboxNumber,
  isChecked
) => {
  // Find the specific checkbox
  // This relies on a @@unique([patientId, area, checkboxNumber]) constraint
  // in your schema.prisma file.
  const checkbox = await prisma.checkbox.findUnique({
    where: {
      patientId_area_checkboxNumber: {
        patientId: parseInt(patientId),
        area: area,
        checkboxNumber: parseInt(checkboxNumber),
      },
    },
  });

  if (!checkbox) {
    throw new Error(
      `Checkbox not found for patient ${patientId}, area ${area}, number ${checkboxNumber}`
    );
  }

  // Update it
  return prisma.checkbox.update({
    where: {
      id: checkbox.id,
    },
    data: {
      isChecked: isChecked,
      // Set checkedDate only if we are checking it ON
      // If we are un-checking it, set it to null
      checkedDate: isChecked ? new Date() : null,
    },
  });
};

/**
 * NEW FUNCTION: Adds a new area (with 8 checkboxes) to a patient.
 * (Your existing, correct function)
 */
export const addAreaToPatient = async (patientId, area) => {
  // 1. Validate the area
  if (!Object.values(AreaType).includes(area)) {
    throw new Error(`Invalid area type: ${area}`);
  }

  // 2. Check if any checkboxes *already* exist for this patient/area
  const existingCheckboxes = await prisma.checkbox.count({
    where: {
      patientId: parseInt(patientId),
      area: area,
    },
  });

  if (existingCheckboxes > 0) {
    throw new Error(`Patient already has checkboxes for area: ${area}`);
  }

  // 3. Create the 8 new checkboxes in memory
  const checkboxesToCreate = [];
  for (let i = 1; i <= CHECKBOX_COUNT; i++) {
    checkboxToCreate.push({
      patientId: parseInt(patientId),
      area: area,
      checkboxNumber: i,
    });
  }

  // 4. Use createMany to add them all in one database call
  await prisma.checkbox.createMany({
    data: checkboxesToCreate,
  });

  // 5. Return all checkboxes for that area
  return prisma.checkbox.findMany({
    where: {
      patientId: parseInt(patientId),
      area: area,
    },
  });
};
