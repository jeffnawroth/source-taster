-- SPDX-License-Identifier: AGPL-3.0-or-later
-- Content follows the Check's existing ownership, encryption/expiry/deletion policy.
ALTER TABLE verification.checks ADD COLUMN document JSONB;
