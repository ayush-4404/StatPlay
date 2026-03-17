const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadOnCloudinary = require("../utils/FileUpload");
const ApiResponse = require("../utils/ApiResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');

const emailVerificationTemplate = (name, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp-box {
                text-align: center;
                font-size: 32px;
                letter-spacing: 6px;
                padding: 14px;
                margin: 16px 0;
                border-radius: 6px;
                background: #ffffff;
                border: 1px solid #d9d9d9;
                font-weight: 700;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Email Verification</h1>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Use this OTP to verify your StatPlay account:</p>
                <div class="otp-box">${otp}</div>
                <p><strong>This OTP expires in 10 minutes.</strong></p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 Cricket Quiz App. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`;

const forgotPasswordTemplate = (name, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e88e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp-box {
                text-align: center;
                font-size: 32px;
                letter-spacing: 6px;
                padding: 14px;
                margin: 16px 0;
                border-radius: 6px;
                background: #ffffff;
                border: 1px solid #d9d9d9;
                font-weight: 700;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset OTP</h1>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Use this OTP to reset your StatPlay password:</p>
                <div class="otp-box">${otp}</div>
                <p><strong>This OTP expires in 10 minutes.</strong></p>
                <p>If you did not request this reset, please secure your account.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 Cricket Quiz App. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`;

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
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
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

    // Generate email verification OTP
    const verificationOtp = user.generateEmailVerificationOtp();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    let emailSent = false;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Email Verification OTP - StatPlay',
            html: emailVerificationTemplate(user.name, verificationOtp)
        });
        emailSent = true;
    } catch (error) {
        // Log error but don't fail registration - allows development without email
        console.error('Email sending failed:', error.message);
        user.emailVerificationOtp = undefined;
        user.emailVerificationOtpExpiry = undefined;
        user.isEmailVerified = true; // Auto-verify when email unavailable
        await user.save({ validateBeforeSave: false });
    }

    // For API endpoint:
    return res.status(201).json(
        new ApiResponse(
            201, 
            { 
                user: createdUser,
                emailSent,
                message: emailSent 
                    ? "Registration successful! Check your email for OTP verification."
                    : "Registration successful! (Email skipped - check server EMAIL config)"
            }, 
            emailSent ? "Verification OTP sent." : "Registered without email verification."
        )
    )

})


module.exports.loginUser = asyncHandler(async (req, res) => {
  let { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, "username or email is required");
  }

  const normalizedEmail = email ? email.toLowerCase() : null;
  const normalizedUsername = username ? username.toLowerCase() : null;

  const queryConditions = [];
  if (normalizedEmail) queryConditions.push({ email: normalizedEmail });
  if (normalizedUsername) queryConditions.push({ username: normalizedUsername });

  const user = await userModel
    .findOne({ $or: queryConditions })
    .select("+password");

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Email or password incorrect");
  }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email with OTP before logging in.");
    }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await userModel.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});


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
    // Clear cookies and redirect to login
    // res.clearCookie("accessToken", options)
    //    .clearCookie("refreshToken", options);
    
    // return res.redirect('/login')

    // For API endpoint:
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

// Get current user data (for React frontend)
module.exports.getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, user, "User data fetched successfully")
    )
})

// Verify Email
module.exports.verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const normalizedEmail = email.toLowerCase();
    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    const user = await userModel.findOne({
        email: normalizedEmail,
        emailVerificationOtp: hashedOtp,
        emailVerificationOtpExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { username: user.username }, "Email verified successfully")
    );
});

// Resend Verification Email
module.exports.resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const verificationOtp = user.generateEmailVerificationOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: 'Email Verification OTP - StatPlay',
        html: emailVerificationTemplate(user.name, verificationOtp)
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Verification OTP sent successfully")
    );
});

module.exports.requestPasswordResetOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const normalizedEmail = email.toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    const resetOtp = user.generateResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - StatPlay',
        html: forgotPasswordTemplate(user.name, resetOtp)
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset OTP sent successfully")
    );
});

module.exports.resetPasswordWithOtp = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP and new password are required");
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        throw new ApiError(
            400,
            "Password must contain at least one uppercase letter and one number"
        );
    }

    const normalizedEmail = email.toLowerCase();
    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    const user = await userModel.findOne({
        email: normalizedEmail,
        resetPasswordOtp: hashedOtp,
        resetPasswordOtpExpiry: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
});

module.exports.getLeaderboard = asyncHandler(async (req, res) => {
    const users = await userModel
        .find()
        .select('name username photo highestScore gamesPlayed totalScore')
        .sort({ highestScore: -1 })
        .limit(100);

    const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        username: user.username,
        photo: user.photo,
        highestScore: user.highestScore || 0,
        gamesPlayed: user.gamesPlayed || 0,
        averageScore: user.gamesPlayed > 0 ? (user.totalScore / user.gamesPlayed).toFixed(1) : '0'
    }));

    return res.status(200).json(
        new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
    );
});
