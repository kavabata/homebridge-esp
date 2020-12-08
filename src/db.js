const config = require("./config");
const knex = require("knex");

const db = knex({
  client: "mysql",
  connection: config.db
});

module.exports = db;
