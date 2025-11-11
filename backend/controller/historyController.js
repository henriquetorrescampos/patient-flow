import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * POST /api/history
 * Salva um novo registro de histórico para uma área específica
 */
export const saveHistory = async (req, res) => {
  try {
    // 1. Desestrutura a requisição e RENOMEIA patientId para patientIdStr
    const { patientId: patientIdStr, area, checkboxes, savedAt } = req.body;

    // 2. CONVERTE patientId para INTEIRO (patientId é Int no Prisma)
    const patientId = parseInt(patientIdStr);

    // 3. Validação Básica
    if (!patientId || isNaN(patientId) || !area || !checkboxes) {
      return res.status(400).json({
        error:
          "Dados do histórico (patientId, area, checkboxes) são obrigatórios e válidos.",
      });
    }

    // 4. Validação de Existência do Paciente (Obrigatório devido à Foreign Key)
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true }, // Otimiza a busca, só precisamos saber se existe
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }

    // Conta sessões completas
    const sessionsCompleted = checkboxes.filter((c) => c.isChecked).length;

    // Se sessionsCompleted for 0, o usuário não deveria ter clicado em Salvar
    if (sessionsCompleted === 0) {
      return res
        .status(400)
        .json({ error: "Nenhuma sessão marcada para salvar histórico." });
    }

    // 5. Cria o registro de histórico
    const history = await prisma.history.create({
      data: {
        patientId, // É um número inteiro aqui!
        area,
        checkboxes: JSON.stringify(checkboxes),
        sessionsCompleted,
        savedAt: savedAt || new Date().toISOString(),
      },
    });

    // 6. Limpa os checkboxes (resetando a área para um novo ciclo)
    await prisma.checkbox.deleteMany({
      where: {
        patientId: patientId, // É um número inteiro aqui!
        area: area,
      },
    });

    res.status(201).json(history);
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    // Erro 500 para falhas internas ou de conexão com o banco
    res.status(500).json({
      error: "Erro interno do servidor ao salvar histórico.",
      detail: error.message,
    });
  }
};

/**
 * GET /api/history/:patientId
 * Busca todo o histórico de um paciente
 */
export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const history = await prisma.history.findMany({
      where: { patientId: parseInt(patientId) },
      orderBy: { savedAt: "desc" },
    });

    // Parse dos checkboxes de JSON para objeto
    const parsedHistory = history.map((record) => ({
      ...record,
      checkboxes: JSON.parse(record.checkboxes),
    }));

    res.json(parsedHistory);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
};

/**
 * DELETE /api/history/:historyId
 * Deleta um registro específico de histórico
 */
export const deleteHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    const deleted = await prisma.history.delete({
      where: { id: parseInt(historyId) },
    });

    res.json({ message: "Histórico deletado com sucesso", deleted });
  } catch (error) {
    console.error("Erro ao deletar histórico:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Histórico não encontrado" });
    }

    res.status(500).json({ error: "Erro ao deletar histórico" });
  }
};

/**
 * GET /api/history/:patientId/area/:area
 * Busca histórico de uma área específica
 */
export const getAreaHistory = async (req, res) => {
  try {
    const { patientId, area } = req.params;

    const history = await prisma.history.findMany({
      where: {
        patientId: parseInt(patientId),
        area: area,
      },
      orderBy: { savedAt: "desc" },
    });

    const parsedHistory = history.map((record) => ({
      ...record,
      checkboxes: JSON.parse(record.checkboxes),
    }));

    res.json(parsedHistory);
  } catch (error) {
    console.error("Erro ao buscar histórico da área:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
};
