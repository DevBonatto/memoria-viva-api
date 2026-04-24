exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('images', 'public_id');
  if (!hasColumn) {
    await knex.schema.alterTable('images', (table) => {
      table.string('public_id').nullable();
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('images', 'public_id');
  if (hasColumn) {
    await knex.schema.alterTable('images', (table) => {
      table.dropColumn('public_id');
    });
  }
};
