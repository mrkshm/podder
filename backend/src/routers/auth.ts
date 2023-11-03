import { Router } from "express";

import { CreateUserSchema } from "@/types/user";
import { TokenAndIdValidation, SignInValidation, UpdatePasswordValidation } from "@/utils/validationSchema";
import { validate } from "@/middleware/validator";
import {
  create,
  verifyEmail,
  sendReverificationToken,
  generateForgottenPasswordLink,
  grantAccess,
  updatePassword,
  sendProfile,
  signin,
  updateProfile,
  logout
} from "@/controllers/auth";
import { authenticate, isValidPasswordResetToken } from "@/middleware/auth";
import fileParser from "@/middleware/fileParser";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forgot-password", generateForgottenPasswordLink);
router.post("/verify-password-reset-token", validate(TokenAndIdValidation), isValidPasswordResetToken, grantAccess);
router.post("/update-password", validate(UpdatePasswordValidation), isValidPasswordResetToken, updatePassword);
router.post("/signin", validate(SignInValidation), signin);
router.get("/is-auth", authenticate, sendProfile);
router.get("/public", (req, res) => {
  res.json({
    message: "You are going public"
  })
})
router.get("/private", authenticate, (req, res) => {
  res.json({
    message: "You are private"
  })
})

router.post("/update-profile", authenticate, fileParser, updateProfile);
router.post("/log-out", authenticate, logout);

export default router;
