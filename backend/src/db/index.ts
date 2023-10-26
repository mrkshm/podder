import mongoose from 'mongoose';
import { MONGO_URI } from '@/utils/variables';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Failed to connect to MongoDB', err);
  });
