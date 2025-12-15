// Load environment variables from .env
require('dotenv').config();

const { Pool } = require('pg');

// Use only the Render DB URL (or change to DATABASE_URL if you prefer)
const connectionString = process.env.RENDER_DB_URL;

if (!connectionString) {
    console.error('❌ RENDER_DB_URL is not defined in your .env file!');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // required for Render
});

pool.on('connect', () => {
    console.log('🔗 Connected to Render PostgreSQL successfully');
});

module.exports = pool;
