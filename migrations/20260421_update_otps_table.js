exports.up = function (knex) {
  return knex.schema.alterTable('otps', function (table) {
    table.uuid('user_id').nullable().alter();
    table.string('email', 255).nullable();
    table.index(['email', 'type']);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('otps', function (table) {
    table.dropIndex(['email', 'type']);
    table.dropColumn('email');
    table.uuid('user_id').notNullable().alter();
  });
};
