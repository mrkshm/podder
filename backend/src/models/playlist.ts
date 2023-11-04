import { z } from "zod";
import { Schema, ObjectId, models, model, Model } from "mongoose";

export const PlaylistValidationSchema = z.object({
  title: z.string(),
  visibility: z.enum(["public", "private", "auto"]),
  resId: z.custom<ObjectId>().optional(),
  item: z.custom<ObjectId>().optional(),
});

export type PlaylistDocument = z.infer<typeof PlaylistValidationSchema> & {
  owner: ObjectId;
  items: ObjectId[];
};

const playlistSchema = new Schema<PlaylistDocument>({
  title: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  items: [{ type: Schema.Types.ObjectId, required: true, ref: "Audio" }],
  visibility: { type: String, enum: ["public", "private", "auto"], default: "public" },
}, { timestamps: true });

const Playlist = models.Playlist || model("Playlist", playlistSchema);

export default Playlist as Model<PlaylistDocument>;
