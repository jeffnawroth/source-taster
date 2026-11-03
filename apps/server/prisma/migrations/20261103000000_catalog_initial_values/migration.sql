ALTER TABLE verification.history_consents ADD COLUMN settings_version integer NOT NULL DEFAULT 0, ADD COLUMN free_history_checks integer NOT NULL DEFAULT 5, ADD COLUMN free_history_days integer NOT NULL DEFAULT 30, ADD COLUMN paid_history_days integer NOT NULL DEFAULT 90;
ALTER TABLE verification.checks ADD COLUMN history_paid boolean NOT NULL DEFAULT false;
UPDATE verification.checks SET history_paid=true WHERE history_days=90;
