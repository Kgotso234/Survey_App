require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Uses DATABASE_URL from .env
    ssl: {
        rejectUnauthorized: false // Set to true in production with valid SSL certs
    }
}); //Uses .env config

module.exports = pool;
