ALTER TABLE verification.checks ADD COLUMN measured_configuration jsonb;
CREATE TABLE verification.configuration_assertions (id uuid PRIMARY KEY, expires_at timestamptz NOT NULL);
CREATE INDEX configuration_assertions_expiry ON verification.configuration_assertions (expires_at);
-- A Check keeps the selected configuration throughout corrections and Re-checks.
CREATE FUNCTION verification.keep_check_configuration() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.measured_configuration IS DISTINCT FROM OLD.measured_configuration THEN
    RAISE EXCEPTION 'Check configuration is immutable';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER immutable_check_configuration BEFORE UPDATE ON verification.checks
FOR EACH ROW EXECUTE FUNCTION verification.keep_check_configuration();

ALTER TABLE verification.reference_results ADD COLUMN measured_configuration_id text, ADD COLUMN scoring_rules_version text;
