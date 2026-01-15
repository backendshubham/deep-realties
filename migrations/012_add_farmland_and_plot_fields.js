exports.up = function(knex) {
  return knex.schema.table('properties', function(table) {
    // Farmland-specific fields
    table.decimal('farmland_bigha', 10, 2);
    table.decimal('farmland_acre', 10, 2);
    table.decimal('price_per_bigha', 15, 2);
    
    // Plot-specific fields
    table.decimal('plot_total_area', 10, 2);
    table.decimal('plot_length', 10, 2);
    table.decimal('plot_width', 10, 2);
    table.integer('number_of_plots');
  });
};

exports.down = function(knex) {
  return knex.schema.table('properties', function(table) {
    table.dropColumn('farmland_bigha');
    table.dropColumn('farmland_acre');
    table.dropColumn('price_per_bigha');
    table.dropColumn('plot_total_area');
    table.dropColumn('plot_length');
    table.dropColumn('plot_width');
    table.dropColumn('number_of_plots');
  });
};

