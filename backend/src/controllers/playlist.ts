import { RequestHandler } from "express";

export const createPlaylist: RequestHandler = (req, res) => {
  return res.status(200).json({ message: "Playlist created" });
};
