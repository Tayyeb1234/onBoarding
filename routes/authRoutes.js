// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, verifyOTP } = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
} = require("../validators/authValidator");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       description: User registration data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             username: johndoe
 *             email: johndoe@example.com
 *             password: Password123!
 *             role: Viewer
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             example:
 *               message: User registered successfully
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation errors or duplicate entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: User with this email already exists.
 *               errors:
 *                 - msg: Password must be at least 6 characters long.
 *                   param: password
 *                   location: body
 *       500:
 *         description: Server error
 */
router.post("/register", registerValidation, register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       description: User login credentials
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: johndoe@example.com
 *             password: Password123!
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               message: User logged in successfully
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post("/login", loginValidation, login);

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP for user registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       description: OTP verification data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *           example:
 *             email: johndoe@example.com
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOTPResponse'
 *             example:
 *               message: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: OTP is invalid or expired
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", verifyOtpValidation, verifyOTP);

module.exports = router;
