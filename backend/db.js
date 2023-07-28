const { Pool } = require('pg');

const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,

  // // production
  // connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false // Add this line if you encounter SSL certificate validation errors
  // }
});

module.exports = pool;
