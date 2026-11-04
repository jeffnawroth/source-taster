-- Content-free worker pulse. A restore never qualifies as readiness by itself.
CREATE TABLE verification.ops_worker_health (id integer PRIMARY KEY CHECK(id=1), observed_at timestamptz NOT NULL);
