import { prisma } from "../lib/prisma.js";

/**
 * Salva um novo registro de histórico no banco de dados.
 *
 * @param {Object} data - Dados do histórico, incluindo patientId (number), area (string) e checkboxes (Array).
 * @returns {Promise<Object>} - O registro de histórico criado.
 */
export const saveHistory = async ({ patientId, area, checkboxes, savedAt }) => {
  // A conversão de patientId (para garantir que é number) e a validação do paciente
  // devem idealmente ser feitas no Controller, mas garantimos o JSON.stringify aqui.

  const sessionsCompleted = checkboxes.filter((c) => c.isChecked).length;

  const history = await prisma.history.create({
    data: {
      patientId: patientId, // Deve ser number, garantido pelo Controller
      area: area,
      checkboxes: JSON.stringify(checkboxes), // Salva o array como string JSON
      sessionsCompleted: sessionsCompleted,
      savedAt: savedAt || new Date().toISOString(),
    },
  });

  return history;
};

/**
 * Busca todo o histórico de um paciente.
 * @param {number} patientId - ID do paciente.
 * @returns {Promise<Array>} - Lista de registros de histórico.
 */
export const fetchPatientHistory = async (patientId) => {
  const history = await prisma.history.findMany({
    where: { patientId: patientId },
    orderBy: { savedAt: "desc" },
  });

  // Parse dos checkboxes de JSON para objeto antes de retornar
  return history.map((record) => ({
    ...record,
    checkboxes: JSON.parse(record.checkboxes),
  }));
};

/**
 * Deleta um registro específico do histórico.
 * @param {number} historyId - ID do registro de histórico.
 * @returns {Promise<Object>} - O registro deletado.
 */
export const deleteHistory = async (historyId) => {
  return prisma.history.delete({
    where: { id: historyId },
  });
};
