import { RequestHandler } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { CreateUser, VerifyEmailRequest } from "@/types/user";
import User from "@/models/user";
import { generateToken, formatProfile } from "@/utils/helper";
import { sendForgotPasswordLink, sendPasswordResetSuccessEmail, sendVerificationMail } from "@/utils/email";
import emailToken from "@/models/emailToken";
import PasswordResetToken from "@/models/passwordResetToken";
import { isValidObjectId } from "mongoose";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "@/utils/variables";
import { RequestWithFiles } from "@/middleware/fileParser";
import cloudinary from "@/cloud";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ email, password, name });

  const token = generateToken();
  await emailToken.create({
    owner: user._id,
    token: token
  })

  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user: { id: user._id, name, email } });
}

export const verifyEmail: RequestHandler = async (req: VerifyEmailRequest, res) => {
  const { token, userId } = req.body;

  const verificationToken = await emailToken.findOne({
    owner: userId
  })
  if (!verificationToken) {
    return res.status(403).json({ error: "Invalid token" })
  }

  const matching = await verificationToken.compareToken(token);

  if (!matching) {
    return res.status(403).json({ error: "Invalid token" })
  }

  await User.findByIdAndUpdate(userId, {
    verified: true
  });

  await emailToken.findByIdAndDelete(verificationToken._id);

  return res.status(200).json({ message: "Your email is verified!" })
}

export const sendReverificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    return res.status(403).json({ error: "Invalid Request" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(403).json({ error: "Invalid Request" });
  }

  await emailToken.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();
  await emailToken.create({
    owner: userId,
    token
  })

  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user._id.toString(),
  })

  return res.status(200).json({ message: "A new token has been sent. Please check your mail." })
};

export const generateForgottenPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Account not found" });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const token = crypto.randomBytes(36).toString('hex');
  await PasswordResetToken.create({ owner: user._id, token });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgotPasswordLink({ email: user.email, link: resetLink });
  res.json({ message: "Check your email" });

};

export const grantAccess: RequestHandler = async (req, res) => {
  res.status(200).json({ valid: true })
}

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ message: "Invalid user" })

  const matched = await user.comparePassword(password);
  if (matched) return res.status(422).json({ error: "The new password must be different" })

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id });
  sendPasswordResetSuccessEmail(user.name, user.email);
  res.status(201).json({ message: "Your password has been changed." });
}

export const signin: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(403).json({ message: "Email/Password Mismatch" });

  const matched = await user.comparePassword(password);
  if (!matched) return res.status(403).json({ message: "Email/Password Mismatch" });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "12d"
  });
  user.tokens.push(token);
  await user.save();

  return res.status(200).json({
    profile: req.user,
    token
  });
}

export const sendProfile: RequestHandler = async (req, res) => {
  res.json({
    profile: req.user,
  })
}

export const updateProfile: RequestHandler = async (req: RequestWithFiles, res) => {
  const { name } = req.body;
  const avatar = req.files?.avatar


  const user = await User.findById(req.user.id);
  if (!user) throw new Error("something went wrong, user not found")

  if ((typeof name !== "string") || (name.trim().length < 3)) return res.status(422).json({ error: "Invalid name" })

  user.name = name;

  if (avatar) {
    // if there is already an avatar, remove import {  } from "o";
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar?.publicId);
    }

    let filepath: string | undefined;

    if (Array.isArray(avatar)) {
      filepath = avatar[0].filepath;
    } else {
      filepath = avatar.filepath;
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(filepath, {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face"
    });

    user.avatar = { url: secure_url, publicId: public_id };
  }

  await user.save();
  res.json({ profile: formatProfile(user) });
}

export const logout: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;
  const { token } = req;
  const user = await User.findById(req.user.id)
  if (!user) throw new Error("something went wrong, user not found")

  if (fromAll === "yes") user.tokens = []
  else user.tokens = user.tokens.filter((t) => t !== token)

  await user.save();
  res.json({ success: true });
}
