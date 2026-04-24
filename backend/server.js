const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});