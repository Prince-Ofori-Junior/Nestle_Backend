const jwt = require("jsonwebtoken");

// ----------------------------
// AUTH MIDDLEWARE
// ----------------------------
exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
        return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // decoded contains { id, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// ----------------------------
// ROLE-BASED ACCESS CONTROL
// ----------------------------
exports.roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized. No user context found." });

        // Allow single role or array of roles
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to access this resource."
            });
        }

        next();
    };
};
