/*
  Warnings:

  - You are about to drop the `Checkbox` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Checkbox" DROP CONSTRAINT "Checkbox_patientId_fkey";

-- DropTable
DROP TABLE "public"."Checkbox";

-- DropTable
DROP TABLE "public"."Patient";

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "planoSaude" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkboxes" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "area" "AreaType" NOT NULL,
    "checkboxNumber" INTEGER NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkboxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "histories" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "checkboxes" TEXT NOT NULL,
    "sessionsCompleted" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkboxes_patientId_area_checkboxNumber_key" ON "checkboxes"("patientId", "area", "checkboxNumber");

-- CreateIndex
CREATE INDEX "histories_patientId_idx" ON "histories"("patientId");

-- CreateIndex
CREATE INDEX "histories_area_idx" ON "histories"("area");

-- AddForeignKey
ALTER TABLE "checkboxes" ADD CONSTRAINT "checkboxes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
