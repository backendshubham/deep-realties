exports.up = function(knex) {
  return knex.schema.createTable('projects', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('location', 255).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('status', 20).notNullable();
    table.integer('total_units');
    table.integer('available_units');
    table.decimal('price_range_min', 15, 2);
    table.decimal('price_range_max', 15, 2);
    table.specificType('amenities', 'text[]');
    table.specificType('highlights', 'text[]');
    table.specificType('images', 'text[]');
    table.specificType('gallery', 'text[]');
    table.specificType('videos', 'text[]');
    table.text('brochure_url');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.timestamp('completion_date');
    table.timestamp('possession_date');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('city');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};

