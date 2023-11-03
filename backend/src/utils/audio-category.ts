import { z } from 'zod';

export const CategoryValidationSchema = z.union([
  z.literal("Arts"),
  z.literal("Business"),
  z.literal("Education"),
  z.literal("Entertainment"),
  z.literal("Kids & Family"),
  z.literal("Music"),
  z.literal("Science"),
  z.literal("Tech"),
  z.literal("Other"),
]);

export type CategoryType = z.infer<typeof CategoryValidationSchema>;

export const categories = CategoryValidationSchema.options.map(opt => opt.value as string);
