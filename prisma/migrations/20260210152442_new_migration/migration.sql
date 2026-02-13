-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('FRESHER', 'EXPERIENCED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType";

-- CreateTable
CREATE TABLE "CareerAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questions" JSONB[],
    "primaryRole" TEXT NOT NULL,
    "analysis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerAssessment_userId_key" ON "CareerAssessment"("userId");

-- AddForeignKey
ALTER TABLE "CareerAssessment" ADD CONSTRAINT "CareerAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
