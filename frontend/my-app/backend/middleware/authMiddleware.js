import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
  } catch {
    req.userId = null;
  }

  return next();
};

export const requireAuth = (req, res, next) => {
  optionalAuth(req, res, () => {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    return next();
  });
};

export { JWT_SECRET };
