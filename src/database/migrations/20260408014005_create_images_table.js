exports.up = function(knex) {
  return knex.schema.createTable('images', function(table) {
    table.increments('id').primary();
    
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); 
    
    table.string('url').notNullable();
    table.string('game_type').notNullable();
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('images');
};