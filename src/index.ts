// import { testFunction } from './modules/test.js'
import express from 'express';
import bodyParser from 'body-parser';
import movieRouter from './routers/movieRouter.js';
import authRouter from './routers/authRouter.js';

import cors from 'cors';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import errorMiddleware from './middlewares/errorMiddleware.js';

// App creation
const app = express();


dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
const PORT = process.env.PORT || 1212;

app.use(cors({
  origin: '*'
}));


// Request body recognition
app.use(bodyParser.json());

app.use(express.static('static'));
app.use(fileUpload());

// Import user routes
app.use('/api', movieRouter);

// Import authorization routes
app.use('/auth', authRouter);



// The data format
app.use(express.json());

app.use(errorMiddleware);

const starApp = async () => {
  try{
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to db');
      // Start server
      app.listen(PORT, () => {
        if (process.env.NODE_ENV === 'prod'){
          console.log(`Server is running in production mode on port ${PORT}`);
        } else {
          console.log(`Server is running in development mode on port ${PORT}`);
        }
      });
  } catch (err){
    console.log('Error connecting to database', err)
  }
  
}

starApp();
