import * as patientService from "../service/patientService.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const httpCreatePatient = async (req, res) => {
  try {
    const { name, phone, planoSaude } = req.body;

    const newPatient = await prisma.patient.create({
      data: { name, phone, planoSaude },
    });

    // Cria automaticamente 8 checkboxes para cada área
    const areas = ["PSICOPEDAGOGIA", "FONO", "PSICO", "TO"];
    const checkboxesToCreate = [];

    for (const area of areas) {
      for (let i = 1; i <= 8; i++) {
        checkboxesToCreate.push({
          patientId: newPatient.id,
          area,
          checkboxNumber: i,
          isChecked: false,
        });
      }
    }

    await prisma.checkbox.createMany({ data: checkboxesToCreate });

    // Retorna o paciente junto dos checkboxes
    const patientWithCheckboxes = await prisma.patient.findUnique({
      where: { id: newPatient.id },
      include: { checkboxes: true },
    });

    return res.status(201).json(patientWithCheckboxes);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return res.status(500).json({ error: "Erro ao criar paciente." });
  }
};

/**
 * Handles HTTP request to get a single patient by their ID.
 */
export const httpGetPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(parseInt(id));

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get patient" });
  }
};

export const httpGetAllPatients = async (req, res) => {
  try {
    const patients = await patientService.getAllPatients();
    res.status(200).json(patients);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ error: "Erro ao buscar pacientes." });
  }
};
