import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

dotenv.config();
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];

  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.status(401).json({ message: 'Login Required' });
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, decoded: any) => {
      if (err) return res.sendStatus(403);
      req.user = decoded;
      next();
    }
  );
};
