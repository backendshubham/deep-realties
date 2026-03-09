exports.up = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.string('password_reset_token', 255).nullable();
    table.timestamp('password_reset_token_expires_at').nullable();
    table.timestamp('password_reset_token_sent_at').nullable();
    
    table.index('password_reset_token');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropIndex('password_reset_token');
    table.dropColumn('password_reset_token');
    table.dropColumn('password_reset_token_expires_at');
    table.dropColumn('password_reset_token_sent_at');
  });
};

