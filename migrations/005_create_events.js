exports.up = function(knex) {
  return knex.schema.createTable('events', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('location', 255).notNullable();
    table.string('city', 100).notNullable();
    table.timestamp('event_date').notNullable();
    table.string('event_time', 20);
    table.boolean('is_past').defaultTo(false);
    table.text('registration_link');
    table.integer('max_attendees');
    table.specificType('images', 'text[]');
    table.specificType('videos', 'text[]');
    table.integer('registered_count').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('event_date');
    table.index('city');
    table.index('is_past');
  }).then(function() {
    return knex.schema.createTable('event_registrations', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('event_id').references('id').inTable('events').onDelete('CASCADE');
      table.string('full_name', 255).notNullable();
      table.string('email', 255).notNullable();
      table.string('phone', 20).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('event_id');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('event_registrations')
    .then(function() {
      return knex.schema.dropTable('events');
    });
};

