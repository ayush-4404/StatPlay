const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    photo: {
        type: String,
        default: '/public/temp/default.png'
    },
    coins: {
        type: Number,
        default: 10
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    highestScore: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date
    },
    emailVerificationOtp: {
        type: String
    },
    emailVerificationOtpExpiry: {
        type: Date
    },
    resetPasswordOtp: {
        type: String
    },
    resetPasswordOtpExpiry: {
        type: Date
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function (Password) {
    return await bcrypt.compare(Password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
}

userSchema.methods.generateOtp = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

userSchema.methods.generateEmailVerificationOtp = function () {
    const otp = this.generateOtp();
    this.emailVerificationOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
    this.emailVerificationOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

userSchema.methods.generateResetPasswordOtp = function () {
    const otp = this.generateOtp();
    this.resetPasswordOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
    this.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

// // Remove sensitive fields when converting to JSON
// userSchema.methods.toJSON = function() {
//     const obj = this.toObject();
//     delete obj.password;
//     return obj;
// };

module.exports = mongoose.model('User', userSchema);

