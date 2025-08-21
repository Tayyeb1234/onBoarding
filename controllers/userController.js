const { validationResult } = require("express-validator");
const {
  getAllUsers,
  updateUserRoleService,
  getUserByIdService,
  updateUserService,
  deleteUserService
} = require("../services/userService");

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const updateUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await updateUserRoleService({
      requesterId: req.user.userId,
      requesterRole: req.user.role,
      userId: id,
      newRole: role,
    });

    res.status(200).json({
      message: "User role updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update User Role Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;

  try {
    const user = await getUserByIdService({
      requesterId: req.user.userId,
      requesterRole: req.user.role,
      userId: id,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get User By ID Error:", error.message);
    const statusCode =
      error.message.includes("forbidden") ? 403 : 404;
    res.status(statusCode).json({ message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateUserService(
      req.params.id,
      req.body,
      req.user // from auth middleware
    );
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update User Error:", error.message);
    res.status(403).json({ success: false, message: error.message });
  }
};

// Delete user

const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserService(req.params.id, req.user);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(403).json({ success: false, message: error.message });
  }
};



module.exports = { getUsers, updateUserRole, getUserById, updateUser, deleteUser };
