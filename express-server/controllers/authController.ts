import { Request, Response } from 'express';
import { MemberRepository } from '../../member-management/member.repository';
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppEnvs } from '../../read-env';

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const memberRepo = new MemberRepository(db);

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Please enter both your email and password.' });
  }

  try {
    const foundUser = await memberRepo.getByEmail(email);

    if (!foundUser) {
      return res
        .sendStatus(401)
        .json({ error: 'Email or password is incorrect. Please try again.' });
    }
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const accessToken = jwt.sign(
        { id: foundUser.id, email: foundUser.email, role: foundUser.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '3000s' }
      );
      const refreshToken = jwt.sign(
        { id: foundUser.id, email: foundUser.email, role: foundUser.role },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '1d' }
      );

      await memberRepo.update(foundUser.id, { refreshToken });

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: 'Login successful! Welcome back!', accessToken });
    } else {
      res
        .sendStatus(401)
        .json({ error: 'Email or password is incorrect. Please try again.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
