import Router from "express";

import { getPlaylistsForProfile } from "@/controllers/profile";
import { authenticate, isVerified } from "@/middleware/auth";
import { catchAsync } from "@/middleware/catch-async";

const router = Router();

router.get('/playlists', authenticate, isVerified, catchAsync(getPlaylistsForProfile));

export default router;
