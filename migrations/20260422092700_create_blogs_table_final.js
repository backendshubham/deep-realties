exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('blogs');
  if (exists) return;

  return knex.schema.createTable('blogs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('slug').notNullable().unique();
    table.text('excerpt');
    table.text('content').notNullable();
    table.string('featured_image_url');
    table.string('seo_title');
    table.text('seo_description');
    table.string('seo_keywords');
    table.boolean('is_published').defaultTo(false);
    table.timestamp('published_at');
    table.timestamps(true, true);

    table.index('slug');
    table.index('is_published');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('blogs');
};
