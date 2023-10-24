import 'dotenv/config';
import express from 'express';
import passport from 'passport';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connectWithDatabase } from './config/database.js';
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js';
import { errorHandlerMiddleware } from './middleware/errorMiddleware.js';

import { router as authRouter } from './api/auth/authRoutes.js';
import { router as userRouter } from './api/user/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// logger
app.use(morgan('dev'));

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(PORT, async () => {
  console.log(`server is running at http://localhost:${PORT}`);
  await connectWithDatabase();
});
