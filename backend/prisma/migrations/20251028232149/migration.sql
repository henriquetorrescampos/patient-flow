-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('FONO', 'TO', 'PSICO', 'PSICOPEDAGOGIA');

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "planoSaude" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkbox" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "area" "AreaType" NOT NULL,
    "checkboxNumber" INTEGER NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Checkbox_patientId_area_checkboxNumber_key" ON "Checkbox"("patientId", "area", "checkboxNumber");

-- AddForeignKey
ALTER TABLE "Checkbox" ADD CONSTRAINT "Checkbox_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
