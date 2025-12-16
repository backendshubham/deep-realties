exports.up = function(knex) {
  return knex.schema.createTable('contact_submissions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20);
    table.string('subject', 255).notNullable();
    table.text('message').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.boolean('is_responded').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('is_read');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('contact_submissions');
};

