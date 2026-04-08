exports.up = function(knex) {
  return knex.schema.createTable('rankings', function(table) {
    table.increments('id').primary();
    
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    table.string('game_type').notNullable();
    
    table.integer('time_seconds').notNullable();
    table.integer('errors').notNullable().defaultTo(0);
    table.integer('score').notNullable(); 
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('rankings');
};