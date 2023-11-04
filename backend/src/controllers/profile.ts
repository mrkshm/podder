import Playlist from "@/models/playlist";
import { RequestHandler } from "express";

export const getPlaylistsForProfile: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query;

  const parsedPageNo = isNaN(parseInt(pageNo as string)) ? 0 : parseInt(pageNo as string);
  const parsedLimit = isNaN(parseInt(limit as string)) ? 20 : parseInt(limit as string);

  const data = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: 'auto' }
  })
    .skip(parsedPageNo * parsedLimit)
    .limit(parsedLimit)
    .sort('-createdAt');

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
