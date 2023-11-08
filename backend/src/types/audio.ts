import { ObjectId } from 'mongoose';
import { AudioDocument } from '@/models/audio';

export type PopulateFavList = AudioDocument<{ _id: ObjectId; name: string }>;