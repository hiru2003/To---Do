const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDb() {
    try {
        console.log("Checking and initializing database...");
        
        // 1. Create connection without database to ensure DB exists
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "1234"
        });
        
        const dbName = process.env.DB_NAME || "todo_app";
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempConnection.end();
        console.log(`Database '${dbName}' verified/created.`);

        // 2. Now use the main pool connection to create tables
        const db = require("./db");
        
        // Create users table if it doesn't exist
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await db.query(createUsersTableQuery);
        console.log("Database initialized successfully: 'users' table is ready.");

        // Create todos table if it doesn't exist
        const createTodosTableQuery = `
            CREATE TABLE IF NOT EXISTS todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        
        await db.query(createTodosTableQuery);
        console.log("Database initialized successfully: 'todos' table is ready.");
    } catch (err) {
        console.error("Database initialization failed:", err.message);
        throw err;
    }
}

module.exports = initDb;
