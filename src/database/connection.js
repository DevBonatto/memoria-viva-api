const knexConfig = require('../../knexfile');
const db = require('knex')(knexConfig.development);

module.exports = db;