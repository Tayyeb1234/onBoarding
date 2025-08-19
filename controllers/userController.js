// controllers/userController.js
const User = require("../models/User");
const { validationResult } = require("express-validator");

// Get All Users (Admin Only)
const getUsers = async (req, res) => {
  try {
    let users = await User.find().select("-password"); // Exclude passwords

    // Example: filter out deleted users (using .filter)
    users = users.filter(user => !user.isDeleted);

    // Example: map to return cleaner JSON objects
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update User Role (Admin Only)
const updateUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { role } = req.body;

  try {
    if (req.user.userId === id && role !== "Admin") {
      return res.status(400).json({ message: "Admins cannot downgrade their own role." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update User Role Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get User by ID (with .find usage on in-memory array after query)
const getUserById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    let users = await User.find().select("-password"); // get all users

    // Example: find specific user from in-memory array (instead of direct DB)
    const user = users.find(u => u._id.toString() === id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.user.role !== "Admin" && req.user.userId !== user._id.toString()) {
      return res.status(403).json({ message: "Access forbidden: insufficient permissions." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get User By ID Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { getUsers, getUserById, updateUserRole };
