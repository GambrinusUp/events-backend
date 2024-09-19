/*
  Warnings:

  - You are about to drop the `_ManagerCompany` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ManagerCompany" DROP CONSTRAINT "_ManagerCompany_A_fkey";

-- DropForeignKey
ALTER TABLE "_ManagerCompany" DROP CONSTRAINT "_ManagerCompany_B_fkey";

-- DropTable
DROP TABLE "_ManagerCompany";
