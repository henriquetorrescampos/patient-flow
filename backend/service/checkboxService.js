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
  const pId = parseInt(patientId);
  const cNum = parseInt(checkboxNumber);

  // 1. Define a data (se estiver marcando, usa a data atual; senão, é null)
  const checkedDate = isChecked ? new Date() : null;

  // 2. Tenta ATUALIZAR ou CRIAR (Upsert) o registro
  return prisma.checkbox.upsert({
    where: {
      // Chave única para localizar o registro
      patientId_area_checkboxNumber: {
        patientId: pId,
        area: area,
        checkboxNumber: cNum,
      },
    },
    update: {
      // Se ENCONTRAR: Apenas atualiza o estado e a data
      isChecked: isChecked,
      checkedDate: checkedDate,
    },
    create: {
      // Se NÃO ENCONTRAR (após deletar o histórico): Cria o novo registro
      patientId: pId,
      area: area,
      checkboxNumber: cNum,
      isChecked: isChecked,
      checkedDate: checkedDate,
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
    checkboxesToCreate.push({
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

/**
 * Updates the checked date of a checkbox.
 */
export const updateCheckboxDate = async (
  patientId,
  area,
  checkboxNumber,
  newDate
) => {
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

  // Só permite alterar a data se o checkbox estiver marcado
  if (!checkbox.isChecked) {
    throw new Error("Cannot update date of an unchecked checkbox");
  }

  return prisma.checkbox.update({
    where: {
      id: checkbox.id,
    },
    data: {
      checkedDate: new Date(newDate),
    },
  });
};
