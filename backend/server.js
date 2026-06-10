const express = require("express");
const cors = require("cors");
require("dotenv").config();
const initDb = require("./config/initDb");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Mount authentication routes
app.use("/api/auth", authRoutes);

// Initialize DB and start server
const PORT = process.env.PORT || 5000;

initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Server starting failed due to database error:", err.message);
        process.exit(1);
    });