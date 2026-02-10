const {Router} = require("express");
const {registerUser, loginUser, getCurrentUser, logoutUser, verifyEmail, resendVerificationEmail} = require("../controllers/user.controller");
// const loginUser = require("../controllers/user.controller")
const upload =  require("../middlewares/multer.middleware");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router.route("/register").post(
    upload.single("profilePicture"),
    registerUser
)
router.route("/login").post(
    loginUser
);

router.route("/logout").post(verifyJWT, logoutUser)

// Get current user data (for React frontend)
router.route("/current-user").get(verifyJWT, getCurrentUser)

// Email verification routes
router.route("/verify-email/:token").get(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);

module.exports = router;