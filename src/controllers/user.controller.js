const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadOnCloudinary = require("../utils/FileUpload");
const ApiResponse = require("../utils/ApiResponse")

const registerUser = asyncHandler(async (req, res) => {
    let { name, username, email, password } = req.body;

    if (
        [name, username, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email.toLowerCase();
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
    if (!emailRegex.test(normalizedEmail)) {
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
        $or: [{ normalizedEmail }, { normalizedUsername }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const picture = req.file;
    if (!picture) {
        throw new ApiError(400, "Profile photo is required");
    }
    const profilePicture = await uploadOnCloudinary(picture.path);

    if(!profilePicture?.url){
        throw new ApiError(500, "Profile photo upload failed");
    }

    let user = await userModel.create({
        name,
        username : normalizedUsername,
        email : normalizedEmail,
        password,
        photo : profilePicture.url

    })

    const createdUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

})

module.exports = registerUser