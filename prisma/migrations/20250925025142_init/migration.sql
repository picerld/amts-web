/*
  Warnings:

  - You are about to drop the column `grade` on the `User` table. All the data in the column will be lost.
  - Added the required column `category` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LobbyStatus" AS ENUM ('WAITING', 'ONGOING', 'FINISHED');

-- AlterTable
ALTER TABLE "public"."Bank" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "grade";

-- CreateTable
CREATE TABLE "public"."ExamLobby" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "bankId" INTEGER,
    "status" "public"."LobbyStatus" NOT NULL DEFAULT 'WAITING',
    "startTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamLobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LobbyUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LobbyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserGrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGrade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ExamLobby" ADD CONSTRAINT "ExamLobby_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamLobby" ADD CONSTRAINT "ExamLobby_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyUser" ADD CONSTRAINT "LobbyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyUser" ADD CONSTRAINT "LobbyUser_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."ExamLobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGrade" ADD CONSTRAINT "UserGrade_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGrade" ADD CONSTRAINT "UserGrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
