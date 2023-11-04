import { Router } from "express";

import { catchAsync } from "@/middleware/catch-async";
import { PlaylistValidationSchema } from "@/models/playlist";
import { authenticate, isVerified } from "@/middleware/auth";
import { createPlaylist } from "@/controllers/playlist";
import { validate } from "@/middleware/validator";

const router = Router();

router.post('/create', authenticate, isVerified, validate(PlaylistValidationSchema), catchAsync(createPlaylist));

export default router;
