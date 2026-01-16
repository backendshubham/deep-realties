exports.up = function(knex) {
  return knex.schema.createTable('property_images', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('property_id').references('id').inTable('properties').onDelete('CASCADE');
    table.text('image_url').notNullable();
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
    
    table.index('property_id');
    table.index('display_order');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('property_images');
};

