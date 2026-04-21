exports.up = function (knex) {
  return knex.schema
    .alterTable('users', function (table) {
      table.boolean('is_verified').defaultTo(false);
    })
    .createTable('otps', function (table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('otp_code', 6).notNullable();
      table.string('type', 20).notNullable(); // 'registration', 'forgot_password'
      table.timestamp('expires_at').notNullable();
      table.timestamps(true, true);
      
      table.index(['user_id', 'type']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('otps')
    .alterTable('users', function (table) {
      table.dropColumn('is_verified');
    });
};
