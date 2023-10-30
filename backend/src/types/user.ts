import { Request } from "express";
import { z } from "zod";

export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, "Name is too short"),
    email: z.string().trim().email("Not a valid email"),
    password: z.string().min(4, "Password need to have at least 4 characters"),
  })
})
export type CreateUser = Request & z.infer<typeof CreateUserSchema>;
