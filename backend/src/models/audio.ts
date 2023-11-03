import { CategoryValidationSchema, categories } from "@/utils/audio-category";
import { Model, models, model, ObjectId, Schema } from "mongoose";
import { z } from "zod";

const AudioValidation = z.object({
    title: z.string(),
    about: z.string(),
    owner: z.custom<ObjectId>(),
    file: z.object({
        url: z.string(),
        publicId: z.string(),
    }),
    cover: z.optional(
        z.object({
            url: z.string(),
            publicId: z.string(),
        })
    ),
    likes: z.array(z.custom<ObjectId>()),
    category: CategoryValidationSchema,
    })

export type AudioDocument = z.infer<typeof AudioValidation>;

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
