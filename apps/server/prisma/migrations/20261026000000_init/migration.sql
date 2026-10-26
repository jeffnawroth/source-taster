-- CreateTable
CREATE TABLE "checks" (
    "id" UUID NOT NULL,
    "owner_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "last_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_slots" (
    "check_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "original_text" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "reference_slots_pkey" PRIMARY KEY ("check_id","position")
);

-- CreateTable
CREATE TABLE "check_events" (
    "check_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_events_pkey" PRIMARY KEY ("check_id","seq")
);

-- CreateIndex
CREATE INDEX "checks_owner_id_idx" ON "checks"("owner_id");

-- AddForeignKey
ALTER TABLE "reference_slots" ADD CONSTRAINT "reference_slots_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_events" ADD CONSTRAINT "check_events_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
