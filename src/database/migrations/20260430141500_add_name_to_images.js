exports.up = function(knex) {
  return knex.schema.alterTable('images', function(table) {
    table.string('name').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('images', function(table) {
    table.dropColumn('name');
  });
};
