import { RequestHandler } from "express";
import { startOfDay, endOfDay } from "date-fns";
import History from "@/models/history";
import AppError from "@/errors/app-error";
import { getParsedPagination, type PaginationQuery } from "@/utils/pagination";
import { PipelineStage } from "mongoose";

export const updateHistory: RequestHandler = async (req, res) => {
  const { audio, progress, date } = req.body;

  // We'll use the startOfDay and endOfDay to generate the date range for the current day.
  const startDate = startOfDay(date);
  const endDate = endOfDay(date);

  // Attempt to update an existing history entry for the given user, audio, and date.
  const updatedHistory = await History.findOneAndUpdate(
    {
      userId: req.user.id,
      audio,
      date: { $gte: startDate, $lte: endDate },
    },
    {
      $set: {
        progress,
        date,
      },
    },
    {
      // If no match is found, a new document will be created.
      upsert: true,
      // This option ensures that the updated document is returned.
      new: true,
    }
  );

  // If the update or creation was successful, return a success message.
  if (updatedHistory) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(500).json({ success: false, message: "Failed to update history." });
  }
};

export const deleteSingleHistory: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const historyEntry = await History.findById(id);

  if (!historyEntry) {
    throw new AppError("History entry not found", 404);
  }

  if (historyEntry.userId.toString() !== req.user.id.toString()) {
    throw new AppError("You don't have permission to delete this history entry", 403);
  }
  await historyEntry.deleteOne();

  return res.status(200).json({ success: true, message: "History entry deleted successfully." });
};

export const deleteMultipleHistories: RequestHandler = async (req, res) => {
  const { ids } = req.body; // Assuming the request body will contain an array of ids named "ids"

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("No history entries provided for deletion", 400);
  }

  // Find all the entries to ensure they all belong to the user
  const historyEntries = await History.find({
    '_id': { $in: ids },
    'userId': req.user.id
  });

  if (historyEntries.length !== ids.length) {
    throw new AppError("One or more history entries not found or don't belong to the user", 404);
  }

  // If all checks pass, delete the entries
  await History.deleteMany({ '_id': { $in: ids } });

  return res.status(200).json({ success: true, message: "History entries deleted successfully." });
};

export const deleteAllHistories: RequestHandler = async (req, res) => {
  await History.deleteMany({ userId: req.user.id });
  return res.status(200).json({ success: true, message: "History entries deleted successfully." });
}

export const getAllHistories: RequestHandler = async (req, res) => {
  const { parsedLimit, skipValue } = getParsedPagination(req.query as PaginationQuery);

  const matchStage = { $match: { userId: req.user.id } };
  const lookupStage = {
    $lookup: {
      from: "audios",
      localField: "audio",
      foreignField: "_id",
      as: "audioInfo",
    },
  };
  const unwindStage = { $unwind: "$audioInfo" };
  const projectionStage = {
    $project: {
      _id: 0,
      id: "$_id",
      audioId: "$audioInfo._id",
      date: 1,
      title: "$audioInfo.title",
    },
  };
  const groupStage = {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$date" },
      },
      audios: { $push: "$$ROOT" },
    },
  };
  const projectGroupStage = {
    $project: {
      _id: 0,
      date: "$_id",
      audios: 1,
    },
  };
  const sortStage: PipelineStage = { $sort: { "date": -1 } };
  const paginationStages = [{ $skip: skipValue }, { $limit: parsedLimit }];

  // Get total count of documents
  const totalCount = await History.countDocuments({ userId: req.user.id });

  // Execute the aggregation pipeline with pagination
  const histories = await History.aggregate([
    matchStage,
    lookupStage,
    unwindStage,
    projectionStage,
    groupStage,
    projectGroupStage,
    sortStage,
    ...paginationStages,
  ]);

  res.json({ totalCount, histories });
};

export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const limit = 10;

  const matchStage = { $match: { userId: req.user.id } };
  const sortStage: PipelineStage = { $sort: { date: -1 } };
  const limitStage = { $limit: limit };
  const lookupStage = {
    $lookup: {
      from: 'audios',
      localField: 'audio',
      foreignField: '_id',
      as: 'audioInfo',
    },
  };
  const unwindStage = { $unwind: '$audioInfo' };
  const projectStage = {
    $project: {
      _id: 0,
      id: '$_id',
      audioId: '$audioInfo._id',
      date: 1,
      title: '$audioInfo.title',
    },
  };

  const recentlyPlayed = await History.aggregate([
    matchStage,
    sortStage,
    limitStage,
    lookupStage,
    unwindStage,
    projectStage,
  ]);

  res.json({ recentlyPlayed });
};

