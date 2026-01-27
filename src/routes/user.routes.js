const {Router} = require("express");
const {registerUser, loginUser,displayProfile,logoutUser} = require("../controllers/user.controller");
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

router.route("/profile").get(
    verifyJWT,
    displayProfile
)

module.exports = router;