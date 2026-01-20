exports.up = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.string('email_verification_otp_hash', 255).nullable();
    table.timestamp('email_verification_otp_expires_at').nullable();
    table.timestamp('email_verification_otp_sent_at').nullable();
    table.integer('email_verification_attempts').notNullable().defaultTo(0);

    table.index('email_verified');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropIndex('email_verified');
    table.dropColumn('email_verified');
    table.dropColumn('email_verification_otp_hash');
    table.dropColumn('email_verification_otp_expires_at');
    table.dropColumn('email_verification_otp_sent_at');
    table.dropColumn('email_verification_attempts');
  });
};


