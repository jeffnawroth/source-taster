-- Delivery state for settlement intents (#99). The Quota journal lives in the
-- private service; this table only remembers what that service acknowledged.
ALTER TABLE "settlement_intents" ADD COLUMN "delivered_at" TIMESTAMPTZ(3);
CREATE INDEX "settlement_intents_pending" ON "settlement_intents"("delivered_at", "created_at");
