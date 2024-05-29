import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error(e);
  });

export default mongoose;
