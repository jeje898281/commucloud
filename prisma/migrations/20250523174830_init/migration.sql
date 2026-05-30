/*
  Warnings:

  - You are about to drop the `AdminUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Community` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MeetingAttendanceLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resident` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoteLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminUser" DROP CONSTRAINT "AdminUser_community_id_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_community_id_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_create_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "MeetingAttendanceLog" DROP CONSTRAINT "MeetingAttendanceLog_create_admin_user_fkey";

-- DropForeignKey
ALTER TABLE "MeetingAttendanceLog" DROP CONSTRAINT "MeetingAttendanceLog_meeting_id_fkey";

-- DropForeignKey
ALTER TABLE "MeetingAttendanceLog" DROP CONSTRAINT "MeetingAttendanceLog_resident_id_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_create_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_meeting_id_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_community_id_fkey";

-- DropForeignKey
ALTER TABLE "VoteLog" DROP CONSTRAINT "VoteLog_create_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "VoteLog" DROP CONSTRAINT "VoteLog_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "VoteLog" DROP CONSTRAINT "VoteLog_resident_id_fkey";

-- DropTable
DROP TABLE "AdminUser";

-- DropTable
DROP TABLE "Community";

-- DropTable
DROP TABLE "Meeting";

-- DropTable
DROP TABLE "MeetingAttendanceLog";

-- DropTable
DROP TABLE "Proposal";

-- DropTable
DROP TABLE "Resident";

-- DropTable
DROP TABLE "VoteLog";

-- CreateTable
CREATE TABLE "community" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_user" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'manager',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "resident_sqm" DOUBLE PRECISION NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "MeetingStatus" NOT NULL,
    "sqm_threshold" DOUBLE PRECISION NOT NULL,
    "resident_threshold" DOUBLE PRECISION NOT NULL,
    "community_id" INTEGER NOT NULL,
    "create_admin_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendance_log" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "create_admin_user" INTEGER NOT NULL,
    "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_attendance_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sqm_threshold" DOUBLE PRECISION NOT NULL,
    "resident_threshold" DOUBLE PRECISION NOT NULL,
    "create_admin_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_log" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "vote_result" "VoteResult" NOT NULL,
    "create_admin_user_id" INTEGER NOT NULL,
    "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_username_key" ON "admin_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "resident_username_key" ON "resident"("username");

-- AddForeignKey
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident" ADD CONSTRAINT "resident_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_create_admin_user_id_fkey" FOREIGN KEY ("create_admin_user_id") REFERENCES "admin_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendance_log" ADD CONSTRAINT "meeting_attendance_log_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendance_log" ADD CONSTRAINT "meeting_attendance_log_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendance_log" ADD CONSTRAINT "meeting_attendance_log_create_admin_user_fkey" FOREIGN KEY ("create_admin_user") REFERENCES "admin_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_create_admin_user_id_fkey" FOREIGN KEY ("create_admin_user_id") REFERENCES "admin_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_log" ADD CONSTRAINT "vote_log_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_log" ADD CONSTRAINT "vote_log_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_log" ADD CONSTRAINT "vote_log_create_admin_user_id_fkey" FOREIGN KEY ("create_admin_user_id") REFERENCES "admin_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
