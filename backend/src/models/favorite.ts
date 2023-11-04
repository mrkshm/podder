import { ObjectId, Schema, models, model, Model } from "mongoose";

interface FavoriteDocument {
  owner: ObjectId;
  items: ObjectId[];
}

export const favoriteSchema = new Schema<FavoriteDocument>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  items: [{ type: Schema.Types.ObjectId, ref: "Audio" }]
}, { timestamps: true });

const Favorite = models.Favorite || model("Favorite", favoriteSchema);

export default Favorite as Model<FavoriteDocument>;
