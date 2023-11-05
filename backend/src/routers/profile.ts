import Router from "express";

import { getPlaylistsForProfile, getUploads, getPublicUploads, updateFollower, getPublicPlaylists, getPublicProfile } from "@/controllers/profile";
import { authenticate, isVerified } from "@/middleware/auth";
import { catchAsync } from "@/middleware/catch-async";

const router = Router();

router.get('/playlists', authenticate, isVerified, catchAsync(getPlaylistsForProfile));
router.get('/uploads', authenticate, catchAsync(getUploads));
router.get('/info/:profileId', catchAsync(getPublicProfile));
router.get('/playlists/:profileId', catchAsync(getPublicPlaylists));
router.get('/uploads/:profileId', catchAsync(getPublicUploads));
router.post('/update-follower/:profileId', authenticate, catchAsync(updateFollower));

export default router;
