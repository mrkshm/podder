import { RequestHandler } from "express";

export const getPlaylistsForProfile: RequestHandler = (req, res) => {
  return res.status(200).json({ message: "Playlists are here" });
};
