exports.up = function () {
  // Legacy migration placeholder for email_verifications table.
  // The real migration file is missing; this prevents Knex from failing
  // while keeping the current DB structure unchanged.
  return Promise.resolve();
};

exports.down = function () {
  // No-op rollback to match the placeholder up migration.
  return Promise.resolve();
};

