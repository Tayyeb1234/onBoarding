const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

dotenv.config();

connectDB();

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send(
    "Welcome to the Role-Based Authentication and Product Management System API"
  );
});

module.exports = app;

// Start the server only in non-test environments
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
}

process.on("uncaughtException", (error) => {
  console.log("error", error);
});

// console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
