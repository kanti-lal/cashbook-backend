import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);

    if (!user || !user.id) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}
