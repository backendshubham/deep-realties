exports.up = function(knex) {
  return knex.schema.createTable('property_requirements', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('property_type', 50).notNullable();
    table.decimal('min_budget', 15, 2).notNullable();
    table.decimal('max_budget', 15, 2).notNullable();
    table.string('preferred_location', 255).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100);
    table.decimal('min_area_sqft', 10, 2);
    table.decimal('max_area_sqft', 10, 2);
    table.integer('bedrooms');
    table.integer('bathrooms');
    table.text('additional_requirements');
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20).notNullable();
    table.boolean('is_fulfilled').defaultTo(false);
    table.specificType('matched_properties', 'uuid[]');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('city');
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('property_requirements');
};

