ALTER TABLE verification.checks
 ADD COLUMN lease_expires_at TIMESTAMPTZ(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + interval '75 seconds'),
 ADD COLUMN ended_at TIMESTAMPTZ(3), ADD COLUMN end_reason TEXT,
 ADD COLUMN dispatch_order BIGINT NOT NULL DEFAULT 0;
UPDATE verification.checks SET ended_at=created_at,end_reason='completed' WHERE state='ended';
CREATE SEQUENCE verification.dispatch_order;
ALTER TABLE verification.reference_slots
 ADD COLUMN generation INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN revision INTEGER NOT NULL DEFAULT 1,
 ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN claim_until TIMESTAMPTZ(3), ADD COLUMN started_at TIMESTAMPTZ(3),
 ADD COLUMN progress TEXT NOT NULL DEFAULT 'queued';
UPDATE verification.reference_slots SET progress='ended' WHERE status<>'running';
ALTER TABLE verification.reference_results ADD COLUMN generation INTEGER NOT NULL DEFAULT 0, ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
CREATE UNIQUE INDEX reference_results_check_id_position_generation_key ON verification.reference_results(check_id,position,generation);
CREATE TABLE verification.settlement_intents (
 check_id UUID NOT NULL,position INTEGER NOT NULL,generation INTEGER NOT NULL,outcome TEXT NOT NULL,
 created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(check_id,position,generation)
);
