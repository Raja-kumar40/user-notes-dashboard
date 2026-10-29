const express = require("express");
const rateLimit = require("express-rate-limit");

const {
    signup,
    login,
    me
} = require("../controllers/auth.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Try again later."
    }
});

router.post("/signup", loginLimiter, signup);
router.post("/login", loginLimiter, login);
router.get("/me", authenticateToken, me);

module.exports = router;