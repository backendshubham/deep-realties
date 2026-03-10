exports.up = function(knex) {
  return knex.schema.createTable('testimonials', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('role').notNullable();
    table.string('initials').notNullable();
    table.string('tag').nullable();
    table.string('location').nullable();
    table.text('quote').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.boolean('is_archived').notNullable().defaultTo(false);
    table.integer('display_order').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('testimonials');
};

