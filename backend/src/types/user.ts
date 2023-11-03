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

export interface VerifyEmailRequest extends Request {
  body: {
    userId: string;
    token: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: any,
        name: string,
        email: string,
        verified: boolean,
        avatar?: string,
        followers: number,
        followings: number
      };
      token: string;
    }
  }
}


