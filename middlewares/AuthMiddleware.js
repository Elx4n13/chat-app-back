import jwt from "jsonwebtoken";
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Assuming "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = payload.userId;
    next();
  });
};

