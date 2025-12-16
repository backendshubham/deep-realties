exports.up = function(knex) {
  return knex.schema.createTable('rental_properties', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('locality', 255).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.decimal('monthly_rent', 10, 2).notNullable();
    table.decimal('security_deposit', 10, 2);
    table.string('property_type', 50).notNullable();
    table.decimal('area_sqft', 10, 2).notNullable();
    table.integer('bedrooms');
    table.integer('bathrooms');
    table.string('rent_type', 20).defaultTo('unfurnished');
    table.string('tenant_type', 20).defaultTo('any');
    table.timestamp('available_from');
    table.specificType('amenities', 'text[]');
    table.specificType('images', 'text[]');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.string('status', 20).defaultTo('pending');
    table.boolean('is_active').defaultTo(true);
    table.string('full_name', 255);
    table.string('email', 255);
    table.string('phone', 20);
    table.timestamps(true, true);
    
    table.index('city');
    table.index('status');
    table.index('monthly_rent');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('rental_properties');
};

