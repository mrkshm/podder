import { Model, Schema, model } from "mongoose";
import { ObjectId } from "@/utils/object-id-util";
import { z } from "zod";

const UserDocumentSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(4),
  verified: z.boolean().default(false),
  avatar: z.optional(
    z.object({
      url: z.string(),
      publicId: z.string(),
    })
  ),
  tokens: z.array(z.string()),
  favorites: z.array(z.instanceof(ObjectId)),
  followers: z.array(z.instanceof(ObjectId)),
  followings: z.array(z.instanceof(ObjectId)),
});

type UserDocument = z.infer<typeof UserDocumentSchema>;

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
  },
  avatar: {
    type: Object,
    url: String,
    publicId: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: "Audio"
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  followings: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  tokens: [String]
}, { timestamps: true });

export default model("User", userSchema) as Model<UserDocument>;
