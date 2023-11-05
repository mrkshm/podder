import AppError from "@/errors/app-error";
import Playlist from "@/models/playlist";
import { RequestHandler } from "express";
import { isValidObjectId, ObjectId } from "mongoose";
import User from "@/models/user";
import Audio, { AudioDocument } from "@/models/audio";
import { getParsedPagination, type PaginationQuery } from "@/utils/pagination";

export const getPlaylistsForProfile: RequestHandler = async (req, res) => {
  const { parsedPageNo, parsedLimit } = getParsedPagination(req.query as PaginationQuery);

  const data = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: 'auto' }
  })
    .skip(parsedPageNo * parsedLimit)
    .limit(parsedLimit)
    .sort('-createdAt')
    .lean();

  const playlists = data.map((item) => {
    return {
      item: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility
    }
  })

  return res.status(200).json({ playlists });
};

export const updateFollower: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) throw new AppError("Profile Id is invalid", 422);

  const profile = await User.findById(profileId);
  if (!profile) throw new AppError("No profile with this ID", 404);

  const alreadyFollower = await User.findOne({ _id: profileId, followers: req.user.id });

  if (alreadyFollower) {
    await User.updateOne({
      _id: profileId
    }, {
      $pull: {
        followers: req.user.id
      }
    })

    await User.updateOne({
      _id: req.user.id
    }, {
      $pull: {
        followings: profileId
      }
    })
  } else {
    await User.updateOne({
      _id: profileId
    }, {
      $addToSet: {
        followers: req.user.id
      }
    })

    await User.updateOne({
      _id: req.user.id
    }, {
      $addToSet: {
        followings: profileId
      }
    })
  }

  return res.status(200).json({ message: alreadyFollower ? "Follower removed" : "Follower added" });
};

export const getUploads: RequestHandler = async (req, res) => {
  const { parsedPageNo, parsedLimit, skipValue } = getParsedPagination(req.query as PaginationQuery);

  const data = await Audio.find({ owner: req.user.id })
    .skip(skipValue)
    .limit(parsedLimit)
    .sort("-createdAt")
    .lean();

  const uploads = data.map((upload) => {
    return {
      id: upload._id,
      title: upload.title,
      about: upload.about,
      file: upload.file.url,
      cover: upload.cover?.url,
      date: upload.createdAt,
      owner: {
        name: req.user.name,
        id: req.user.id
      }
    }
  })
  return res.status(200).json({ uploads });
};

export const getPublicUploads: RequestHandler = async (req, res) => {
  const { parsedLimit, skipValue } = getParsedPagination(req.query as PaginationQuery);

  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) throw new AppError("Profile Id is invalid", 403);


  const data = await Audio.find({ owner: profileId })
    .skip(skipValue)
    .limit(parsedLimit)
    .sort("-createdAt")
    .populate<AudioDocument<{ name: string; _id: ObjectId }>>("owner")
    .lean();

  const uploads = data.map((upload) => {
    return {
      id: upload._id,
      title: upload.title,
      about: upload.about,
      file: upload.file.url,
      cover: upload.cover?.url,
      date: upload.createdAt,
      owner: {
        name: upload.owner.name,
        id: upload.owner._id
      }
    }
  })
  return res.status(200).json({ uploads });
};

export const getPublicProfile: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) throw new AppError("Profile Id is invalid", 403);

  const user = await User.findById(profileId).lean();
  if (!user) throw new AppError("Profile not found", 404);

  return res.status(200).json({
    id: user._id,
    name: user.name,
    followers: user.followers.length,
    avatar: user.avatar?.url,
  })
}

export const getPublicPlaylists: RequestHandler = async (req, res) => {
  const { parsedLimit, skipValue } = getParsedPagination(req.query as PaginationQuery);

  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) throw new AppError("Profile Id is invalid", 400);

  const playlists = await Playlist.find({
    owner: profileId,
    visibility: "public"
  })
    .skip(skipValue)
    .limit(parsedLimit)
    .sort("-createdAt")
    .lean();

  return res.status(200).json({
    playlists: playlists.map((playlist) => {
      return {
        id: playlist._id,
        title: playlist.title,
        itemsCount: playlist.items.length,
        visibility: playlist.visibility
      }
    })
  })
}
