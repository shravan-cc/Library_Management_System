import express from 'express';
import {
  getMemberByIdHandler,
  listMembersHandler,
  createMemberHandler,
  updateMemberHandler,
  deleteMemberHandler,
} from '../controllers/memberController';
import { validateMemberDataMiddleware } from '../middleware/middleware';
const app = express();

export const memberRouter = express.Router();

memberRouter.get('/', listMembersHandler);
memberRouter.get('/:id', getMemberByIdHandler);
memberRouter.post('/', validateMemberDataMiddleware, createMemberHandler);
memberRouter.patch('/:id', validateMemberDataMiddleware, updateMemberHandler);
memberRouter.delete('/:id', deleteMemberHandler);

app.use(memberRouter);
