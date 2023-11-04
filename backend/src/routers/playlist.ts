import { Router } from "express";

import { catchAsync } from "@/middleware/catch-async";
import { authenticate, isVerified } from "@/middleware/auth";
import { CreatePlaylistRequestSchema } from "@/types/playlist";
import { createPlaylist, updatePlaylist, deletePlaylist, removeFromPlaylist, getPlaylist } from "@/controllers/playlist";
import { validate } from "@/middleware/validator";

const router = Router();

router.post('/', authenticate, isVerified, validate(CreatePlaylistRequestSchema), catchAsync(createPlaylist));
router.patch('/:playlistId', authenticate, isVerified, validate(CreatePlaylistRequestSchema), catchAsync(updatePlaylist));
router.delete('/:playlistId', authenticate, isVerified, catchAsync(deletePlaylist));
router.delete('/:playlistId/item/:resId', authenticate, isVerified, catchAsync(removeFromPlaylist));
router.get('/:playlistId', authenticate, catchAsync(getPlaylist));

export default router;
