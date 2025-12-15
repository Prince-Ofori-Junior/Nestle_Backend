const pool = require('./config/db');

const createTables = async () => {
    try {
        // Users
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Admin / Technician / Employee
    department VARCHAR(255),   -- Add this
    created_at TIMESTAMP DEFAULT NOW()
);

        `);

        // Assets
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50),
                serial_number VARCHAR(50),
                assigned_user INT REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'available',
                warranty_expiry DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tickets
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                urgency VARCHAR(20) DEFAULT 'medium',
                status VARCHAR(20) DEFAULT 'open',
                employee_id INT REFERENCES users(id),
                technician_id INT REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Ticket Messages
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_messages (
                id SERIAL PRIMARY KEY,
                ticket_id INT REFERENCES tickets(id),
                sender_id INT REFERENCES users(id),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Activity Logs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id),
                action TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ All tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating tables:', err);
        process.exit(1);
    }
};

createTables();
