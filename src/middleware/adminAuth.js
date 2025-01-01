import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
