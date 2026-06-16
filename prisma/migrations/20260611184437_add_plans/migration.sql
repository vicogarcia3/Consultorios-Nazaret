-- CreateTable
CREATE TABLE "Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT,
    "planId" INTEGER,
    "joinDate" DATETIME,
    "nextCleaning" DATETIME,
    "paymentStatus" TEXT NOT NULL DEFAULT 'al_dia',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patient_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("createdAt", "dni", "id", "name", "phone") SELECT "createdAt", "dni", "id", "name", "phone" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_dni_key" ON "Patient"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
