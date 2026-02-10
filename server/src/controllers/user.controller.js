const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadOnCloudinary = require("../utils/FileUpload");
const ApiResponse = require("../utils/ApiResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');

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

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${verificationToken}`;

    // Email HTML content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #4CAF50; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to StatPlay!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>Thank you for registering with StatPlay. Please verify your email address to complete your registration.</p>
                    <p>Click the button below to verify your email:</p>
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all;">${verificationUrl}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Cricket Quiz App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Send verification email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Email Verification - StatPlay',
            html: htmlContent
        });
    } catch (error) {
        // If email fails, delete the user and throw error
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        
        throw new ApiError(500, "Failed to send verification email. Please try again.");
    }

    // Redirect to check-email page after registration
    // return res.redirect('/check-email')

    // For API endpoint:
    return res.status(201).json(
        new ApiResponse(
            201, 
            { 
                user: createdUser,
                message: "Registration successful! Please check your email to verify your account."
            }, 
            "User registered successfully. Verification email sent."
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
    throw new ApiError(403, "Please verify your email before logging in.");
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
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with matching token and non-expired token
    const user = await userModel.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // Redirect to React email-verified success page
    return res.redirect(`${process.env.CORS_ORIGIN}/email-verified?username=${user.username}`);
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

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${verificationToken}`;

    // Email HTML content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #4CAF50; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
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
                    <h2>Hello ${user.name}!</h2>
                    <p>You requested a new verification link. Click the button below to verify your email:</p>
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all;">${verificationUrl}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Cricket Quiz App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Send verification email
    await sendEmail({
        email: user.email,
        subject: 'Resend Email Verification - StatPlay',
        html: htmlContent
    });

    // Redirect back to check-email page
    // return res.redirect('/check-email');

    // For API endpoint:
    return res.status(200).json(
        new ApiResponse(200, {}, "Verification email sent successfully")
    );
});
