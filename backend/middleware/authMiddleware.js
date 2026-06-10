const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        
        // Expected format: Bearer <token>
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Access denied. No authentication token provided." });
        }

        const jwtSecret = process.env.JWT_SECRET || "supersecretfallbackkey12345";

        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Session expired or invalid token. Please log in again." });
            }

            // Attach user details to req object
            req.user = decoded;
            next();
        });

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Internal server error during authentication check" });
    }
};

module.exports = authMiddleware;
