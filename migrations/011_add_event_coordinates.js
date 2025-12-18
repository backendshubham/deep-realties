exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    // Add latitude and longitude for map integration
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    
    // Index for location queries
    table.index('latitude');
    table.index('longitude');
  });
};

exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    table.dropIndex('longitude');
    table.dropIndex('latitude');
    table.dropColumn('longitude');
    table.dropColumn('latitude');
  });
};

