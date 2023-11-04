import { RequestWithFiles } from "@/middleware/fileParser";
import { CategoryType } from "@/utils/audio-category";
import { RequestHandler } from "express";
import formidable from "formidable";
import cloudinary from "@/cloud";
import Audio from "@/models/audio";
import AppError from "@/errors/app-error";

interface CreateAudioRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    category: CategoryType;
  };
}

export const createAudio: RequestHandler = async (
  req: CreateAudioRequest,
  res
) => {
  const { title, about, category } = req.body;
  const cover = req.files?.cover as formidable.File;
  const audioFile = req.files?.file as formidable.File;
  const ownerId = req.user.id;

  if (!audioFile) throw new AppError("Audio file is missing!", 422);

  try {
    const audioRes = await cloudinary.uploader.upload(audioFile.filepath, {
      resource_type: "video",
    });
    const newAudio = new Audio({
      title,
      about,
      category,
      owner: ownerId,
      file: { url: audioRes.url, publicId: audioRes.public_id },
    });

    if (cover) {
      const coverRes = await cloudinary.uploader.upload(cover.filepath, {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      });

      newAudio.cover = {
        url: coverRes.secure_url,
        publicId: coverRes.public_id,
      };
    }

    await newAudio.save();

    res
      .status(201)
      .json({
        audio: {
          title,
          about,
          file: newAudio.file.url,
          cover: newAudio.cover?.url,
        },
      });
  } catch (error) {
    console.error("Error creating audio:", error);
    throw new AppError("Something went wrong!", 500);
  }
};


export const updateAudio: RequestHandler = async (
  // TODO add check for audio owner
  req: CreateAudioRequest,
  res
) => {
  const { title, about, category } = req.body;
  const cover = req.files?.cover as formidable.File;
  const ownerId = req.user.id;
  const { audioId } = req.params;

  const audio = await Audio.findOneAndUpdate({ owner: ownerId, _id: audioId }, {
    title, about, category
  }, { new: true });

  if (!audio) throw new AppError("Audio not found!", 400);

  if (cover) {
    if (audio.cover?.publicId) {
      await cloudinary.uploader.destroy(audio.cover.publicId);
    }

    const coverRes = await cloudinary.uploader.upload(cover.filepath, {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
    });

    audio.cover = {
      url: coverRes.secure_url,
      publicId: coverRes.public_id,
    };

    await audio.save();
  }

  return res
    .status(200)
    .json({
      audio: { title, about, file: audio.file.url, cover: audio.cover?.url },
    });

};
