import { RequestHandler } from "express";
import PasswordResetToken from "@/models/passwordResetToken";
import { JwtPayload, verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/utils/variables";
import User from "@/models/user";

export const isValidPasswordResetToken: RequestHandler = async (req, res, next) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken) return res.status(403).json({ error: "Not authorized, invalid token" });

  const matched = await resetToken.compareToken(token);
  if (!matched) return res.status(403).json({ error: "Not authorized, invalid token" });

  next();
}

export const authenticate: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];
  if (!token) return res.status(403).json({ message: "You are not authorized" });

  const payload = verify(token, JWT_SECRET) as JwtPayload;
  const id = payload.userId;

  const user = await User.findOne({ _id: id, tokens: token });
  if (!user) return res.status(403).json({ message: "You are not authorized" });

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  }
  req.token = token;

  next();
}

export const isVerified: RequestHandler = async (req, res, next) => {
  if (!req.user.verified) return res.status(403).json({ message: "You are not verified" });
  next();
}