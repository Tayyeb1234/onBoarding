// config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Role-Based Authentication and User Management API",
      version: "1.0.0",
      description:
        "API documentation for the Role-Based Authentication and User Management System.",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      // Add production server URLs as needed
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "60d0fe4f5311236168a109ca",
            },
            username: {
              type: "string",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              example: "johndoe@example.com",
            },
            role: {
              type: "string",
              enum: ["Admin", "Editor", "Viewer"],
              example: "Viewer",
            },
            isDeleted: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-12-30T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-12-30T12:00:00.000Z",
            },
          },
        },
        // Define additional schemas as needed
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
