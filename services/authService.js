// services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const transporter = require("../config/email");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Helper to send OTP email
const sendOTPEmail = async (toEmail, username, otp) => {
    const templatePath = path.join(__dirname, "../emails/otpEmail.html");
    let template = fs.readFileSync(templatePath, "utf8");

    template = template.replace(/{{username}}/g, username);
    template = template.replace(/{{otp}}/g, otp);
    template = template.replace(/{{currentYear}}/g, new Date().getFullYear());

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: "Your OTP Code for Registration",
        html: template,
    });
};

// Service: Register User
const registerUser = async ({ username, email, password, role }) => {
    let user = await User.findOne({ email });
    if (user) throw new Error("User with this email already exists.");

    user = await User.findOne({ username });
    if (user) throw new Error("Username is already taken.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        otp,
        otpExpires,
    });

    await user.save();
    await sendOTPEmail(user.email, user.username, otp);

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return { token };
};

// Service: Verify OTP
const verifyUserOTP = async ({ email, otp }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or OTP.");

    if (user.isOTPVerified) throw new Error("OTP has already been verified.");
    if (user.otp !== otp) throw new Error("Invalid OTP.");
    if (user.otpExpires < Date.now()) throw new Error("OTP has expired.");

    user.isOTPVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { message: "OTP verified successfully. Your account is now active." };
};

// Service: Login
const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password.");
    if (!user.isOTPVerified) throw new Error("Please verify your OTP before logging in.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return { token };
};

module.exports = { registerUser, verifyUserOTP, loginUser };
