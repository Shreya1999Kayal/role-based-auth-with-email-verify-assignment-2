const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthenticated = async (req, res, next) => {
    try {
        const token=req.cookies?.token || req.body?.token||req.query?.token||req.headers['x-access-token']||req.headers['authorization'];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Find user
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

         if (user.token !== token) {
            return res.status(401).json({
                success: false,
                message: "Token mismatch (possible logout or reuse)"
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = isAuthenticated;
