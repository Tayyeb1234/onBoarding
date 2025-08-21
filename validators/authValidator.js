// validators/authValidator.js
const { body } = require("express-validator");

const registerValidation = [
    body("username")
        .notEmpty()
        .withMessage("Username is required.")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long."),
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address."),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long."),
];

const loginValidation = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address."),
    body("password").notEmpty().withMessage("Password is required."),
];

const verifyOtpValidation = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address."),
    body("otp")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be a 6-digit number.")
        .isNumeric()
        .withMessage("OTP must contain only numbers."),
];

module.exports = {
    registerValidation,
    loginValidation,
    verifyOtpValidation,
};
