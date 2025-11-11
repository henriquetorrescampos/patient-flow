const BASE_API_URL = import.meta.env.VITE_API_URL;

/**
 * Salva o histórico de uma área específica para um paciente
 * @param {number} patientId - ID do paciente
 * @param {string} area - Área (FONO, TO, PSICO, PSICOPEDAGOGIA)
 * @param {Array} checkboxes - Lista de checkboxes marcados dessa área
 * @returns {Promise<Object>} - Histórico salvo
 */
export const saveAreaHistory = async (patientId, area, checkboxes) => {
  try {
    // const response = await fetch(`/api/history`, {
    const response = await fetch(`${BASE_API_URL}/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        area,
        checkboxes,
        savedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao salvar histórico");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    throw error;
  }
};

/**
 * Busca o histórico completo de um paciente
 * @param {number} patientId - ID do paciente
 * @returns {Promise<Array>} - Lista de históricos
 */
export const fetchPatientHistory = async (patientId) => {
  try {
    // const response = await fetch(`/api/history/${patientId}`);
    const response = await fetch(`${BASE_API_URL}/api/history/${patientId}`);

    if (!response.ok) {
      throw new Error("Falha ao carregar histórico");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    throw error;
  }
};

/**
 * Deleta um registro específico do histórico
 * @param {number} historyId - ID do histórico
 * @returns {Promise<void>}
 */
export const deleteHistory = async (historyId) => {
  try {
    // const response = await fetch(`/api/history/${historyId}`, {
    const response = await fetch(`${BASE_API_URL}/api/history/${historyId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Falha ao deletar histórico");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar histórico:", error);
    throw error;
  }
};
