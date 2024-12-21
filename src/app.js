const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request body

// Routes
app.use("/api/users", userRoutes);

module.exports = app;
