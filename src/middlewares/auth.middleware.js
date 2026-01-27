const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

module.exports.verifyJWT = asyncHandler(async(req, res, next)=>{

    console.log("Cookies:", req.cookies);
console.log("Authorization header:", req.headers.authorization);

    try {
        const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request login first ")
        }
        const decoded  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await userModel.findById(decoded?._id).select("-password -refreshToken") 
        if(!user){
            throw new ApiError(401,"Invalid access: Login again")
        }
        req.user = user
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid access token")
    }

})