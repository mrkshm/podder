import Router from "express";

import { getPlaylistsForProfile } from "@/controllers/profile";
import { authenticate } from "@/middleware/auth";
import { catchAsync } from "@/middleware/catch-async";

const router = Router();

router.get('/:profileId/playlists', authenticate, catchAsync(getPlaylistsForProfile));

export default router;
