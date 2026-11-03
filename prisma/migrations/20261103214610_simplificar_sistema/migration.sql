/*
  Warnings:

  - You are about to drop the column `professionalId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AccountInvitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AvailabilityException` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BranchOpeningHour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfessionalAvailability` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountInvitation" DROP CONSTRAINT "AccountInvitation_userId_fkey";

-- DropForeignKey
ALTER TABLE "AvailabilityException" DROP CONSTRAINT "AvailabilityException_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AvailabilityException" DROP CONSTRAINT "AvailabilityException_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "BranchOpeningHour" DROP CONSTRAINT "BranchOpeningHour_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalAvailability" DROP CONSTRAINT "ProfessionalAvailability_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalAvailability" DROP CONSTRAINT "ProfessionalAvailability_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_professionalId_fkey";

-- DropIndex
DROP INDEX "User_professionalId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "professionalId";

-- DropTable
DROP TABLE "AccountInvitation";

-- DropTable
DROP TABLE "AvailabilityException";

-- DropTable
DROP TABLE "BranchOpeningHour";

-- DropTable
DROP TABLE "ProfessionalAvailability";
