const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadOnCloudinary = require("../utils/FileUpload");
const ApiResponse = require("../utils/ApiResponse")

const generateTokens = async(userId)=>{
    try{
        const user = await userModel.findById(userId)
        const accessToken =await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken}
    }catch(err){
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

module.exports.registerUser = asyncHandler(async (req, res) => {
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

    if (!profilePicture?.url) {
        throw new ApiError(500, "Profile photo upload failed");
    }

    let user = await userModel.create({
        name,
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        photo: profilePicture.secure_url

    })

    const createdUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

})


module.exports.loginUser = asyncHandler(async (req, res) => {
    let { email,username, password } = req.body;
    if(!(email || username)){
        throw new ApiError(400, "username or email is required")
    }
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(normalizedEmail)) {
        throw new ApiError(400, "Invalid email format");
    }
    const user = await userModel
        .findOne({
            $or: [ {email: normalizedEmail}, {username: normalizedUsername} ]})
        .select("+password");

    if (!user) {
        throw new ApiError(401, "Email or password incorrect");
    }

    // 4️⃣ Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Email or password incorrect");
    }

    let {accessToken, refreshToken} = await generateTokens(user._id)
    const loggedInUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly : true,
        // secure : process.env.NODE_ENV === 'production'
    }
    return res.status(200).cookie("accessToken", accessToken, options).
    cookie("refreshToken", refreshToken,options).
    json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,
                accessToken,
                refreshToken
            },
             "user logged in successfully"
        )
    )
})

module.exports.logoutUser = asyncHandler(async (req, res)=>{
    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },
        {new: true}
    )
    const options = {
        httpOnly :true,
        // secure : process.env.NODE_ENV === 'production'
    }
    return res.status(200).
    clearCookie("accessToken", options).
    clearCookie("refreshToken", options).
    json(
        new ApiResponse(200, {}, " User Logged Out successfully")
    )
})


module.exports.displayProfile = asyncHandler(async (req, res) => {
    // let user = await userModel.findOne({email})
    let user = req.user;
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    res.render("profile", {user})
})


