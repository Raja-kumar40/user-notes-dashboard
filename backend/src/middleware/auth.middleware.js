const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const userId = Number(payload.sub);

        if (!Number.isSafeInteger(userId) || userId < 1) {
            return res.status(401).json({
                success: false,
                message: "Invalid token."
            });
        }

        req.user = {
            id: userId,
            email: payload.email
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

module.exports = authenticateToken;