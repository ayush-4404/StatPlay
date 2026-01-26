const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const registerUser = asyncHandler(async (req, res) => {
    let { name, username, email, password } = req.body();
    if (
        [name, username, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //  Name validation
    if (name.length < 3) {
        throw new ApiError(400, "Name must be at least 3 characters long");
    }

    //  Username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (username.length < 4 || !usernameRegex.test(username)) {
        throw new ApiError(
            400,
            "Username must be at least 4 characters and contain only letters, numbers, or underscores"
        );
    }

    //  Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    //  Password validation
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        throw new ApiError(
            400,
            "Password must contain at least one uppercase letter and one number"
        );
    }
    const existingUser = await userModel.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    req.files?.image
})

module.exports = registerUser