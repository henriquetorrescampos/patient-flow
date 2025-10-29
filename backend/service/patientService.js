import { prisma } from "../lib/prisma.js";
import pkg from "@prisma/client";

const { AreaType } = pkg;

const CHECKBOX_COUNT = 8;

export const createPatientWithCheckboxes = async (patientData) => {
  // Destructure 'areas' from the data. Default to an empty array.
  const { areas = [], ...restOfPatientData } = patientData;

  // 1. Create the checkboxes data in memory ONLY for the specified areas
  const checkboxesToCreate = [];

  for (const area of areas) {
    // Validate that the area is a real enum value
    if (!Object.values(AreaType).includes(area)) {
      throw new Error(`Invalid area type: ${area}`);
    }

    for (let i = 1; i <= CHECKBOX_COUNT; i++) {
      checkboxesToCreate.push({
        area: area,
        checkboxNumber: i,
        isChecked: false,
        checkedDate: null,
      });
    }
  }

  // 2. Create the patient and their specific checkboxes
  const patient = await prisma.patient.create({
    data: {
      ...restOfPatientData,
      checkboxes: {
        // If 'areas' was empty, this 'create' will be an empty array,
        // which is exactly what we want.
        create: checkboxesToCreate,
      },
    },
    include: {
      checkboxes: true, // Return the new patient and their checkboxes
    },
  });

  return patient;
};

export const getPatientById = async (id) => {
  return prisma.patient.findUnique({
    where: { id: parseInt(id) },
    include: {
      checkboxes: true, // Also include their checkboxes when fetching a patient
    },
  });
};

export async function httpCreatePatient(req, res) {
  try {
    const { name, phone, planoSaude } = req.body;

    // 1. Validação simples dos campos obrigatórios
    if (!name || !planoSaude) {
      return res.status(400).json({ 
        error: "Campos 'name' e 'planoSaude' são obrigatórios." 
      });
    }

    // 2. Chame a função de serviço/Prisma para criar o paciente no banco de dados.
    // Exemplo de como você chamaria o Prisma (assumindo que você o importou como 'prisma')
    const newPatient = await prisma.patient.create({
      data: {
        name,
        phone,       
        planoSaude,
      },
      
    });

    // 3. Retorne o novo paciente criado com o status 201 (Created)
    return res.status(201).json(newPatient);

  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return res.status(500).json({ 
        error: "Falha interna do servidor ao criar o paciente." 
    });
  }
}

export const getAllPatients = async () => {
  return await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
};
