import { Model, model, models, ObjectId, Schema } from "mongoose";
import z from "zod";

// Individual History Entry Validation
export const historyEntryValidation = z.object({
  audio: z.custom<ObjectId>(),
  progress: z.number(),
  date: z.string().transform((val) => new Date(val)),
});

export type HistoryEntryType = z.infer<typeof historyEntryValidation>;

// one entry per user per audio per day
const HistoryDocumentValidation = z.object({
  userId: z.custom<ObjectId>(),
  audio: z.custom<ObjectId>(),
  progress: z.number(),
  date: z.date(),
});

export type HistoryDocument = z.infer<typeof HistoryDocumentValidation>;

const historySchema = new Schema<HistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audio: {
      type: Schema.Types.ObjectId,
      ref: "Audio",
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

historySchema.index({ userId: 1, audio: 1, date: 1 }, { unique: true });

const History = models.History || model("History", historySchema);

export default History as Model<HistoryDocument>;

