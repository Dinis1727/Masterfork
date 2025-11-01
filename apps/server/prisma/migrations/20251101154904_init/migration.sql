-- CreateTable
CREATE TABLE "TrainingRegistration" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "formacao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingRegistration_email_idx" ON "TrainingRegistration"("email");

-- CreateIndex
CREATE INDEX "TrainingRegistration_createdAt_idx" ON "TrainingRegistration"("createdAt");
