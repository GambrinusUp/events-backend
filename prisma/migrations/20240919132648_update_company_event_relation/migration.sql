/*
  Warnings:

  - You are about to drop the `_CompanyToEvent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CompanyToEvent" DROP CONSTRAINT "_CompanyToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToEvent" DROP CONSTRAINT "_CompanyToEvent_B_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "companyId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_CompanyToEvent";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
