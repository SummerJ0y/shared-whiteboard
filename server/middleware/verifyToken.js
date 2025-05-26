const jwt = require("jsonwebtoken");
const HttpError = require("../models/http_error");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError("Missing or invalid Authorization header.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET); // ✅ verify using same secret
    req.user = decoded; // contains email, name, etc.
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return next(new HttpError("Invalid or expired token", 401));
  }
};

module.exports = verifyToken;