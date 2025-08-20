// validators/userValidator.js
const { body, param } = require("express-validator");

const getUserByIdValidation = [
    param("id").isMongoId().withMessage("Invalid user ID."),
];

const updateUserRoleValidation = [
    param("id").isMongoId().withMessage("Invalid user ID."),
    body("role")
        .isIn(["Admin", "Editor", "Viewer"])
        .withMessage("Role must be one of Admin, Editor, or Viewer."),
];

module.exports = {
    getUserByIdValidation,
    updateUserRoleValidation,
};
