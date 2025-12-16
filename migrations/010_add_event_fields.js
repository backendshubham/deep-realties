exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    // Event type: builder_meetup, dealer_meetup, inauguration
    table.string('event_type', 50).defaultTo('builder_meetup');
    
    // Related project (for colony inauguration)
    table.uuid('related_project_id').nullable();
    table.foreign('related_project_id').references('id').inTable('projects').onDelete('SET NULL');
    
    // Detailed agenda/highlights
    table.text('agenda');
    
    // Contact person and RSVP info
    table.string('contact_person', 255).nullable();
    table.string('contact_email', 255).nullable();
    table.string('contact_phone', 20).nullable();
    table.text('rsvp_info').nullable();
    
    // Map location (coordinates or embed code)
    table.text('map_location').nullable();
    
    // Event banner image
    table.string('banner_image', 500).nullable();
    
    // Index for event type
    table.index('event_type');
  });
};

exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    table.dropIndex('event_type');
    table.dropColumn('banner_image');
    table.dropColumn('map_location');
    table.dropColumn('rsvp_info');
    table.dropColumn('contact_phone');
    table.dropColumn('contact_email');
    table.dropColumn('contact_person');
    table.dropColumn('agenda');
    table.dropForeign('related_project_id');
    table.dropColumn('related_project_id');
    table.dropColumn('event_type');
  });
};

