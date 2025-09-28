require('dotenv').config();
const { createPool } = require('mysql2/promise');

async function initializeDatabase() {
    try {
        // Create a connection to MySQL without specifying the database
        const connection = await createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create the database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database ${process.env.DB_NAME} created or already exists`);

        // Close the connection
        await connection.end();

        // Now sync the models
        const { sequelize } = require('./config/database');
        await sequelize.sync({ force: false, alter: true });
        console.log('Database synchronized');

        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
