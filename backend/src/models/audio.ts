import { CategoryValidationSchema, categories } from "@/utils/audio-category";
import { Model, models, model, ObjectId, Schema } from "mongoose";
import { z } from "zod";

export const FileValidation = z.object({
  url: z.string(),
  publicId: z.string(),
});

export type FileObject = z.infer<typeof FileValidation>;


export const AudioValidation = z.object({
  title: z.string(),
  about: z.string(),
  owner: z.custom<ObjectId>(),
  likes: z.array(z.custom<ObjectId>()).optional(),
  category: CategoryValidationSchema,
})


export const AudioValidationSchema = z.object({
  body: AudioValidation
})

type BasicAudioDocument = z.infer<typeof AudioValidation>;

export type AudioDocument<T = ObjectId> = BasicAudioDocument & {
  _id: ObjectId;
  owner: T;
  file: FileObject;
  cover?: FileObject;
  createdAt: Date;
}

const AudioSchema = new Schema<AudioDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    file: {
      type: Object,
      url: String,
      publicId: String,
      required: true,
    },
    cover: {
      type: Object,
      url: String,
      publicId: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: categories,
      default: "Other",
    },
  },
  {
    timestamps: true,
  }
);

const Audio = models.Audio || model("Audio", AudioSchema);

export default Audio as Model<AudioDocument>;
