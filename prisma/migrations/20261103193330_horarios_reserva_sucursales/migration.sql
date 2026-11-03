-- CreateTable
CREATE TABLE "BranchOpeningHour" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BranchOpeningHour_branchId_dayOfWeek_idx" ON "BranchOpeningHour"("branchId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "BranchOpeningHour_branchId_dayOfWeek_startMinute_key" ON "BranchOpeningHour"("branchId", "dayOfWeek", "startMinute");

-- AddForeignKey
ALTER TABLE "BranchOpeningHour" ADD CONSTRAINT "BranchOpeningHour_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
