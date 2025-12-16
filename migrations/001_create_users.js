exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255).notNullable();
    table.string('phone', 20);
    table.string('role', 20).notNullable().defaultTo('buyer');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('email');
    table.index('role');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

