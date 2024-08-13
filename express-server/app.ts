import express from 'express';
import bookRouter from './routes/bookRouter';
import { memberRouter } from './routes/memberRouter';
import cookieParser from 'cookie-parser';
import { verifyJWT } from './middleware/verifyJWT';

const app = express();

const PORT = 3001;

app.use(express.json());
app.use(cookieParser());

app.use('/books', verifyJWT, bookRouter);

app.use('/members', memberRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
