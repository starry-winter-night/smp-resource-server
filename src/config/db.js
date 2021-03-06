import dotenv from "dotenv";
dotenv.config({path:'/var/www/smp-resource-server/.env'});
import mongoose from "mongoose";

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: false,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.error(e);
  });

export default mongoose;
