exports.up = function(knex) {
  return knex.schema.createTable('investment_opportunities', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('location', 255).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('investment_type', 100).notNullable();
    table.decimal('min_investment', 15, 2).notNullable();
    table.decimal('expected_roi', 5, 2);
    table.string('investment_period', 100);
    table.specificType('highlights', 'text[]');
    table.string('risk_level', 20);
    table.specificType('images', 'text[]');
    table.specificType('documents', 'text[]');
    table.integer('investors_count').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('city');
    table.index('investment_type');
  }).then(function() {
    return knex.schema.createTable('investor_registrations', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('opportunity_id').references('id').inTable('investment_opportunities').onDelete('SET NULL');
      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('full_name', 255).notNullable();
      table.string('email', 255).notNullable();
      table.string('phone', 20).notNullable();
      table.decimal('investment_budget', 15, 2);
      table.string('preferred_investment_type', 100);
      table.text('message');
      table.boolean('is_contacted').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('opportunity_id');
      table.index('user_id');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('investor_registrations')
    .then(function() {
      return knex.schema.dropTable('investment_opportunities');
    });
};

