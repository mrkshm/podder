import { RequestHandler } from "express";
import AppError from '@/errors/app-error';
import { ObjectId, isValidObjectId } from 'mongoose';
import Audio, { AudioDocument } from '@/models/audio';
import Favorite from "@/models/favorite";

type FavoriteAudio = {
  id: ObjectId;
  title: string;
  category: string;
  file: string;
  cover: string;
  owner: {
    name: string;
    id: ObjectId;
  };
};

export const toggleFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId;

  if (!isValidObjectId(audioId)) throw new AppError("Invalid audio ID", 422);

  const audio = await Audio.findById(audioId)

  if (!audio) throw new AppError("Audio not found", 404);

  const alreadyFaved = await Favorite.findOne({ owner: req.user.id, items: audioId });


  if (alreadyFaved) {
    await Favorite.updateOne({ owner: req.user.id }, { $pull: { items: audioId } });
    await Audio.findByIdAndUpdate(audioId, {
      $pull: { likes: req.user.id }
    })
  } else {
    await Favorite.updateOne({ owner: req.user.id }, { $addToSet: { items: audioId } }, { upsert: true });
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: { likes: req.user.id }
    })
  }

  return res.status(200).json({ message: alreadyFaved ? "Removed from favorites" : "Added to favorites" });
};

export const getFavorites: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  const favorite = await Favorite.findOne({ owner: userId }).populate<{ items: AudioDocument<{ _id: ObjectId, name: string }>[] }>({
    path: "items",
    populate: {
      path: "owner",
    },
  });

  if (!favorite) return res.status(200).json({ favorite: [] });

  const favoriteAudios = favorite.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      cover: item.cover?.url,
      owner: {
        name: item.owner.name,
        id: item.owner._id
      }
    }
  });

  return res.status(200).json({ favoriteAudios });
};

export const getFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId;

  if (!isValidObjectId(audioId)) throw new AppError("Invalid audio ID", 422);


  const favorite = await Favorite.findOne({ owner: req.user.id, items: audioId });

  if (!favorite) return res.status(200).json({ favorite: [] });

  return res.status(200).json({ result: favorite ? true : false });
};
