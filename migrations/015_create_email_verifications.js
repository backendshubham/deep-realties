exports.up = function(knex) {
  return knex.schema.createTable('email_verifications', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable();
    table.string('otp_hash', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('sent_at').defaultTo(knex.fn.now());
    table.integer('attempts').defaultTo(0);
    table.boolean('verified').defaultTo(false);
    table.timestamps(true, true);
    
    table.index('email');
    table.index('expires_at');
    table.index('verified');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('email_verifications');
};

