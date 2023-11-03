import { Model, Schema, model } from "mongoose";
import { ObjectId, ObjectIdType } from "@/utils/object-id-util";
import { z } from "zod";
import { compare, hash } from "bcrypt";

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

export type UserDocument = z.infer<typeof UserDocumentSchema>;

export interface UserDocumentWithId extends UserDocument {
  _id: any;
}

interface Methods {
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument, {}, Methods>({
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

userSchema.pre('save', async function(next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10)
  }
})

userSchema.methods.comparePassword = function(password) {
  return compare(password, this.password)
}

export default model("User", userSchema) as Model<UserDocument, {}, Methods>;
