const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/jwtTokenVerify");
const authorizeRoles = require("../middleware/roleVerify");
const AuthController = require("../controllers/authController");


router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify", AuthController.verify);
router.post("/resend-otp", AuthController.resendOtp);



router.get("/dashboard", isAuthenticated, AuthController.dashboard);

// Role-Based Routes
router.get(
    "/dashboard/admin",
    isAuthenticated,
    authorizeRoles("admin"),
    AuthController.dashboard
);

router.get(
    "/dashboard/user",
    isAuthenticated,
    authorizeRoles("user"),
    AuthController.dashboard
);

// Logout
router.post("/logout", isAuthenticated, AuthController.logout);

module.exports = router;