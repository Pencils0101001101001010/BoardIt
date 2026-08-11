const net = require("net");
net.setDefaultAutoSelectFamilyAttemptTimeout(10000);

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

pool.on("error", (err) => {
  return console.error(
    "Something went wrong in db.js with the db connection",
    err,
  );
});

module.exports = pool;
