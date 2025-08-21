// services/userService.js
const User = require("../models/User");

// Service: Get all users (excluding deleted + formatted)
const getAllUsers = async () => {
    let users = await User.find().select("-password");
    users = users.filter(user => !user.isDeleted);

    return users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    }));
};

// Service: Update user role
const updateUserRoleService = async ({ requesterId, requesterRole, userId, newRole }) => {
    // Prevent admins from downgrading themselves
    if (requesterId === userId && newRole !== "Admin") {
        throw new Error("Admins cannot downgrade their own role.");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    user.role = newRole;
    await user.save();

    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};

// Service: Get user by ID (with permission check)
const getUserByIdService = async ({ requesterId, requesterRole, userId }) => {
    let users = await User.find().select("-password"); // inefficient but matches your example
    const user = users.find(u => u._id.toString() === userId);

    if (!user || user.isDeleted) throw new Error("User not found.");

    // Permission check
    if (requesterRole !== "Admin" && requesterId !== user._id.toString()) {
        throw new Error("Access forbidden: insufficient permissions.");
    }

    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};

// Update user (by admin or self)
const updateUserService = async (userId, updateData, currentUser) => {
    // Only allow self update or admin update
    if (currentUser.role !== "Admin" && currentUser._id.toString() !== userId) {
        throw new Error("Not authorized to update this user");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) throw new Error("User not found");

    return updatedUser;
};

// Delete user (only admin)
const deleteUserService = async (userId, currentUser) => {
    if (currentUser.role !== "Admin") {
        throw new Error("Only admins can delete users");
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) throw new Error("User not found");

    return { message: "User deleted successfully" };
};


module.exports = {
    getAllUsers,
    updateUserRoleService,
    getUserByIdService,
    updateUserService,
    deleteUserService
};
