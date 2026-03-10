exports.up = function () {
  // Legacy migration placeholder for password reset fields on users.
  // The original migration is missing; keep as no-op so Knex can run newer migrations.
  return Promise.resolve();
};

exports.down = function () {
  // No-op rollback for the placeholder up migration.
  return Promise.resolve();
};

