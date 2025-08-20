const { validationResult } = require("express-validator");
const { registerUser, verifyUserOTP, loginUser } = require("../services/authService");

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, role } = req.body;

  try {
    const { token } = await registerUser({ username, email, password, role });
    res.status(201).json({
      message: "User registered successfully. Please check your email for OTP.",
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

  try {
    const result = await verifyUserOTP({ email, otp });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const { token } = await loginUser({ email, password });
    res.status(200).json({ message: "Logged in successfully.", token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { register, verifyOTP, login };
