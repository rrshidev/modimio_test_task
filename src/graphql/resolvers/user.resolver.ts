import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_USER = process.env.JWT_SECRET_USER || 'user-secret-123';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: {
          id: true,
          login: true,
          email: true,
          isVerified: true,
          createdAt: true
        }
      });
      if (!user) throw new Error('User not found');
      return user;
    },
  },
  Mutation: {
    register: async (
      _: any,
      { login, email, password }: { login: string; email: string; password: string }
    ) => {
      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: { login, email, password: hashedPassword },
      });
      const token = sign({ userId: user.id }, JWT_SECRET_USER);
      return { token, user };
    },
    login: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await compare(password, user.password))) {
        throw new Error('Invalid credentials');
      }
      const token = sign({ userId: user.id }, JWT_SECRET_USER);
      return { token, user };
    },
  },
};