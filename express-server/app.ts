import express from 'express';
import bookRouter from './routes/bookRouter';
import { memberRouter } from './routes/memberRouter';

const app = express();
const PORT = 3002;

app.use(express.json());

app.use('/books', bookRouter);

app.use('/members', memberRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
