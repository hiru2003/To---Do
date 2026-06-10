const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        const displayName = (name || username || '').trim();
        const trimmedEmail = email ? email.trim() : '';

        // Basic validations
        if (!displayName || !trimmedEmail || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (displayName.length < 3) {
            return res.status(400).json({ error: "Name must be at least 3 characters long" });
        }

        // Email regex verification
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE email = ? OR name = ?",
            [trimmedEmail, displayName]
        );

        if (existingUsers.length > 0) {
            const isEmailTaken = existingUsers.some(user => user.email.toLowerCase() === trimmedEmail.toLowerCase());
            if (isEmailTaken) {
                return res.status(400).json({ error: "Email is already registered" });
            } else {
                return res.status(400).json({ error: "Name is already taken" });
            }
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into DB
        const [result] = await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [displayName, trimmedEmail, hashedPassword]
        );

        const userId = result.insertId;

        // Create JWT secret if it doesn't exist (fallback)
        const jwtSecret = process.env.JWT_SECRET || "supersecretfallbackkey12345";

        // Generate JWT Token
        const token = jwt.sign(
            { id: userId, name: displayName, email: trimmedEmail },
            jwtSecret,
            { expiresIn: "24h" }
        );

        // Respond with success, user data, and JWT token
        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: userId,
                name: displayName,
                email: trimmedEmail
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Internal server error during registration" });
    }
};

module.exports = {
    registerUser
};
