/*
  Warnings:

  - You are about to drop the `Assessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_userId_fkey";

-- AlterTable
ALTER TABLE "CareerAssessment" ADD COLUMN     "targetRole" TEXT,
ALTER COLUMN "primaryRole" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT;

-- DropTable
DROP TABLE "Assessment";

-- CreateTable
CREATE TABLE "AssessmentFeedback" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isAccurate" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "roadmapData" JSONB NOT NULL,
    "progress" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuiz" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizScore" DOUBLE PRECISION NOT NULL,
    "questions" JSONB[],
    "category" TEXT NOT NULL,
    "improvementTip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentFeedback_assessmentId_key" ON "AssessmentFeedback"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentFeedback_assessmentId_idx" ON "AssessmentFeedback"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerRoadmap_userId_key" ON "CareerRoadmap"("userId");

-- CreateIndex
CREATE INDEX "InterviewQuiz_userId_idx" ON "InterviewQuiz"("userId");

-- AddForeignKey
ALTER TABLE "AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "CareerAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerRoadmap" ADD CONSTRAINT "CareerRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuiz" ADD CONSTRAINT "InterviewQuiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
