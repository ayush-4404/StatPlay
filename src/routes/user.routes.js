const {Router} = require("express");
const registerUser = require("../controllers/user.controller");
const upload =  require("../middlewares/multer.middleware")

const router = Router();

router.route("/register").post(
    upload.single("image"),
    registerUser
)

module.exports = router;