-- A resident can be checked in to a meeting once and can vote on a proposal once.
-- Until now this was only checked in application code (read, then insert), so two
-- scans arriving together could both pass the check and be counted twice.

-- Rows that already slipped through are removed first, keeping the earliest record.
DELETE FROM "meeting_attendance_log" a
USING "meeting_attendance_log" b
WHERE a."meeting_id" = b."meeting_id"
  AND a."resident_id" = b."resident_id"
  AND a."id" > b."id";

DELETE FROM "vote_log" a
USING "vote_log" b
WHERE a."proposal_id" = b."proposal_id"
  AND a."resident_id" = b."resident_id"
  AND a."id" > b."id";

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendance_log_meeting_id_resident_id_key" ON "meeting_attendance_log"("meeting_id", "resident_id");

-- CreateIndex
CREATE UNIQUE INDEX "vote_log_proposal_id_resident_id_key" ON "vote_log"("proposal_id", "resident_id");
