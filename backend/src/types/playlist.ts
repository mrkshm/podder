import { Request } from "express";
import { z } from "zod";

export const CreatePlaylistRequestSchema = z.object({
  body: z.object({
    title: z.string(),
    resId: z.string().optional(),
    visibility: z.enum(["public", "private"]),
  }),
});

export type CreatePlaylistRequest = Request & z.infer<typeof CreatePlaylistRequestSchema>;
