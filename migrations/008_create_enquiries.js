exports.up = function(knex) {
  return knex.schema.createTable('enquiries', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('property_id').references('id').inTable('properties').onDelete('CASCADE');
    table.uuid('buyer_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('seller_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('message').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('property_id');
    table.index('buyer_id');
    table.index('seller_id');
    table.index('is_read');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('enquiries');
};

