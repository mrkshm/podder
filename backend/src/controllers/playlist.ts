import { RequestHandler } from "express";

import { CreatePlaylistRequest } from "@/types/playlist";
import AppError from "@/errors/app-error";
import Audio, { AudioDocument } from "@/models/audio";
import Playlist from "@/models/playlist";
import { ObjectId, isValidObjectId } from "mongoose";

export const createPlaylist: RequestHandler = async (req: CreatePlaylistRequest, res) => {
  const { title, resId, visibility } = req.body;
  const ownerId = req.user.id;


  if (resId) {
    const audio = await Audio.findById(resId);
    if (!audio) throw new AppError("Audio not found", 404);
  }

  const newPlaylist = new Playlist({
    title,
    owner: ownerId,
    visibility
  });

  if (resId) newPlaylist.items = [resId];
  await newPlaylist.save();

  return res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility
    }
  });
};

export const updatePlaylist: RequestHandler = async (req: CreatePlaylistRequest, res) => {
  const { title, item, visibility } = req.body;
  const { playlistId } = req.params;
  const ownerId = req.user.id;

  const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: ownerId }, { title, visibility }, { new: true });
  if (!playlist) throw new AppError("Playlist not found", 404);

  if (item) {
    // in tutorial, get the audio, then refator to this 
    const audioExists = await Audio.exists({ _id: item });
    if (!audioExists) throw new AppError("Audio not found", 404);

    await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: ownerId },
      { $addToSet: { items: item } },
      { new: true });
  }

  return res.status(200).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility
    }
  });
};

export const deletePlaylist: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) throw new AppError("Invalid Playlist Id", 422);

  const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: req.user.id });
  if (!playlist) throw new AppError("Playlist not found", 404);

  return res.status(200).json({ success: true, message: "Playlist deleted" });
};

export const removeFromPlaylist: RequestHandler = async (req, res) => {
  const { playlistId, resId } = req.params;
  if (!isValidObjectId(playlistId)) throw new AppError("Playlist Id is invalid", 422);
  if (!isValidObjectId(resId)) throw new AppError("resId is invalid", 422);

  const playlist = await Playlist.findOneAndUpdate({
    _id: playlistId,
    owner: req.user.id
  }, {
    $pull: { items: resId }
  }, { new: true });

  if (!playlist) throw new AppError("Playlist not found", 404);

  return res.status(200).json({
    success: true,
    message: "Item removed from playlist successfully",
    updatedPlaylist: playlist
  });
}

export const getPlaylist: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new AppError("Invalid Playlist Id", 422);

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user.id
  }).populate<{ items: AudioDocument<{ id: ObjectId, name: string }>[] }>({
    path: "items",
    populate: {
      path: "owner",
      select: "name"
    }
  });
  if (!playlist) throw new AppError("Playlist not found", 404);

  const audios = playlist.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      cover: item.cover?.url,
      owner: {
        name: item.owner.name,
        id: item.owner.id
      }
    }
  })

  return res.status(200).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      audios
    }
  });
};
