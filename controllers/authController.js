// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const dotenv = require("dotenv");
const transporter = require("../config/email");
const fs = require("fs");
const path = require("path");
const generateOTP = require("../utils/generateOTP");

// Load environment variables
dotenv.config();

const register = async (req, res) => {
  // Validate incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    // Check if user with the provided email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Check if username is already taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Create a new user instance
    user = new User({
      username,
      email,
      password,
      role,
    });

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();

    // Set OTP and its expiration time (10 minutes from now)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save the user to the database
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, user.username, otp);

    // Create JWT payload
    const payload = {
      userId: user._id,
      role: user.role,
    };

    // Sign the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Respond to the client
    res.status(201).json({
      message:
        "User registered successfully. Please check your email for the OTP to verify your account.",
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Function to send OTP email
const sendOTPEmail = async (toEmail, username, otp) => {
  try {
    // Read the OTP HTML template
    const templatePath = path.join(__dirname, "../emails/otpEmail.html");
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders with actual values using regex for global replacement
    template = template.replace(/{{username}}/g, username);
    template = template.replace(/{{otp}}/g, otp);
    template = template.replace(/{{currentYear}}/g, new Date().getFullYear());

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender address
      to: toEmail, // Receiver's email
      subject: "Your OTP Code for Registration", // Subject line
      html: template, // HTML body
    });

    console.log(`OTP email sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${toEmail}:`, error.message);
    // Optionally, handle email sending failures (e.g., retry logic, notify admins)
  }
};

// Function to verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP." });
    }

    // Check if OTP has already been verified
    if (user.isOTPVerified) {
      return res
        .status(400)
        .json({ message: "OTP has already been verified." });
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP has expired
    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // OTP is valid; update user's OTP verification status
    user.isOTPVerified = true;
    user.otp = undefined; // Remove OTP
    user.otpExpires = undefined; // Remove OTP expiration
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully. Your account is now active.",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Function to send welcome email
// const sendWelcomeEmail = async (toEmail, username) => {
//   try {
//     // Read the HTML template
//     const templatePath = path.join(__dirname, "../emails/welcome.html");
//     let template = fs.readFileSync(templatePath, "utf8");

//     // Replace placeholders with actual values
//     template = template.replace(/{{username}}/g, username);
//     template = template.replace(
//       /{{loginUrl}}/g,
//       `${process.env.CLIENT_URL}/login`
//     );
//     template = template.replace(/{{currentYear}}/g, new Date().getFullYear());

//     // Send the email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER, // Sender address
//       to: toEmail, // Receiver's email
//       subject: "Welcome to Our App!", // Subject line
//       html: template, // HTML body
//     });

//     console.log(`Welcome email sent to ${toEmail}`);
//   } catch (error) {
//     console.error(`Error sending welcome email to ${toEmail}:`, error.message);
//     // Optionally, handle email sending failures (e.g., retry logic, notify admins)
//   }
// };

// Login Controller (No changes needed for email functionality)
// const login = async (req, res) => {
//   // Validate incoming request
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { email, password } = req.body;

//   try {
//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password." });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password." });
//     }

//     // Create JWT payload
//     const payload = {
//       userId: user._id,
//       role: user.role,
//     };

//     // Sign the JWT token
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     // Respond to the client
//     res.status(200).json({
//       message: "Logged in successfully.",
//       token,
//     });
//   } catch (error) {
//     console.error("Login Error:", error.message);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

const login = async (req, res) => {
  // Validate incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if OTP is verified
    if (!user.isOTPVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your OTP before logging in." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Create JWT payload
    const payload = {
      userId: user._id,
      role: user.role,
    };

    // Sign the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Respond to the client
    res.status(200).json({
      message: "Logged in successfully.",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { register, login, verifyOTP };
