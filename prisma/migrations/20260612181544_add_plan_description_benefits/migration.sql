/*
  Warnings:

  - Added the required column `benefits` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT NOT NULL
);
INSERT INTO "new_Plan" ("id", "name", "price") SELECT "id", "name", "price" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
