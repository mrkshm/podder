import { createAudio, updateAudio } from "@/controllers/audio";
import { authenticate, isVerified } from "@/middleware/auth";
import fileParser from "@/middleware/fileParser";
import { validate } from "@/middleware/validator";
import { catchAsync } from "@/middleware/catch-async";
import { AudioValidationSchema } from "@/models/audio";
import { Router } from "express";

const router = Router();

router.post("/create", authenticate, isVerified, fileParser, validate(AudioValidationSchema), catchAsync(createAudio));
router.patch("/:audioId", authenticate, isVerified, fileParser, validate(AudioValidationSchema), catchAsync(updateAudio));

export default router;
