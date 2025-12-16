exports.up = function(knex) {
  return knex.schema.createTable('properties', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('seller_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('locality', 255).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.decimal('price', 15, 2).notNullable();
    table.string('property_type', 50).notNullable();
    table.string('listing_type', 20).defaultTo('sale');
    table.decimal('area_sqft', 10, 2).notNullable();
    table.integer('bedrooms');
    table.integer('bathrooms');
    table.integer('floors');
    table.boolean('parking');
    table.string('plot_number', 50);
    table.string('facing', 20);
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.boolean('is_farmland').defaultTo(false);
    table.text('google_earth_link');
    table.specificType('amenities', 'text[]');
    table.specificType('images', 'text[]');
    table.string('status', 20).defaultTo('pending');
    table.integer('views').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.string('full_name', 255);
    table.string('email', 255);
    table.string('phone', 20);
    table.timestamps(true, true);
    
    table.index('city');
    table.index('state');
    table.index('status');
    table.index('property_type');
    table.index('seller_id');
    table.index('price');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('properties');
};

