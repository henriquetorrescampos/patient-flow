import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

// Carrega as variáveis do arquivo .env localizado na pasta atual (backend)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Iniciando migração de checkboxes (9 e 10)...");

  try {
    // 1. Busca todos os pacientes cadastrados
    const patients = await prisma.patient.findMany();
    const areas = ["PSICOPEDAGOGIA", "FONO", "PSICO", "TO"];
    let createdCount = 0;

    for (const patient of patients) {
      for (const area of areas) {
        // 2. Verifica e cria os checkboxes 9 e 10
        for (let i = 9; i <= 10; i++) {
          const exists = await prisma.checkbox.findUnique({
            where: {
              patientId_area_checkboxNumber: {
                patientId: patient.id,
                area: area,
                checkboxNumber: i,
              },
            },
          });

          if (!exists) {
            await prisma.checkbox.create({
              data: {
                patientId: patient.id,
                area: area,
                checkboxNumber: i,
                isChecked: false,
              },
            });
            createdCount++;
          }
        }
      }
      console.log(`✅ Paciente ID ${patient.id} processado.`);
    }

    console.log(`\n✨ Migração concluída com sucesso!`);
    console.log(`📦 Total de novos checkboxes criados: ${createdCount}`);
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
