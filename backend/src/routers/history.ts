import Router from "express";

import { deleteSingleHistory, updateHistory, deleteAllHistories, deleteMultipleHistories, getAllHistories, getRecentlyPlayed } from "@/controllers/history";
import { authenticate, isVerified } from "@/middleware/auth";
import { validate } from "@/middleware/validator";
import { catchAsync } from "@/middleware/catch-async";
import { historyEntryValidation } from "@/models/history";

const router = Router();

router.post("/", authenticate, isVerified, validate(historyEntryValidation), catchAsync(updateHistory));
router.delete("/:id", authenticate, isVerified, catchAsync(deleteSingleHistory));
router.delete("/multiple", authenticate, isVerified, catchAsync(deleteMultipleHistories));
router.delete("/all", authenticate, isVerified, catchAsync(deleteAllHistories));
router.get("/", authenticate, catchAsync(getAllHistories));
router.get("/recent", authenticate, catchAsync(getRecentlyPlayed));

export default router;
