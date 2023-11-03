import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const TokenAndIdValidation = z.object({
  body: z.object({
    token: z.string().trim(),
    userId: z.string().refine(isValidObjectId, { message: "Invalid ObjectId" })
  })
})

export const UpdatePasswordValidation = z.object({
  body: z.object({
    token: z.string().trim(),
    userId: z.string().refine(isValidObjectId, { message: "Invalid ObjectId" }),
    password: z.string().min(6, { message: "Must be at least 6 characters" })
  })
})

export const SignInValidation = z.object({
  body: z.object({
    email: z.string().email({ message: "Needs to be a valid email address" }),
    password: z.string()
  })
})
