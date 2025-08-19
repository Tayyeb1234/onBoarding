// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getUsers,
  updateUserRole,
  getUserById,
} = require("../controllers/userController");
const { body, param } = require("express-validator");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and information
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Access token missing.
 *       403:
 *         description: Forbidden - Insufficient permissions.
 *       500:
 *         description: Server error.
 */

router.get("/", authenticateToken, authorizeRoles("Admin"), getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request - Invalid user ID.
 *       401:
 *         description: Unauthorized - Access token missing or invalid.
 *       403:
 *         description: Forbidden - Insufficient permissions.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

router.get(
  "/:id",
  authenticateToken,
  [param("id").isMongoId().withMessage("Invalid user ID.")],
  getUserById
);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       description: New role for the user
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Admin, Editor, Viewer]
 *                 example: Editor
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User role updated successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       example: Editor
 *       400:
 *         description: Bad Request - Validation errors or attempting to downgrade own role.
 *       401:
 *         description: Unauthorized - Access token missing or invalid.
 *       403:
 *         description: Forbidden - Insufficient permissions.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

router.patch(
  "/:id/role",
  authenticateToken,
  authorizeRoles("Admin"),
  [
    param("id").isMongoId().withMessage("Invalid user ID."),
    body("role")
      .isIn(["Admin", "Editor", "Viewer"])
      .withMessage("Role must be one of Admin, Editor, or Viewer."),
  ],
  updateUserRole
);

module.exports = router;
