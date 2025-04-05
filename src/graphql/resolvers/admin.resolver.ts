import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN || 'admin-secret-123';

export const adminResolvers = {
  Query: {
    users: async (
      _: any,
      { search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number },
      context: any
    ) => {
      if (!context.adminId) throw new Error('Admin access denied');

      return prisma.user.findMany({
        where: search
          ? {
              OR: [
                { login: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          login: true,
          email: true,
          isVerified: true,
          createdAt: true,
        },
      });
    },

    adminProfile: async (_: any, __: any, context: any) => {
      if (!context.adminId) throw new Error('Admin access denied');
      return prisma.admin.findUnique({
        where: { id: context.adminId },
        select: { id: true, email: true },
      });
    },
  },

  Mutation: {
    adminLogin: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin || !(await compare(password, admin.password))) {
        throw new Error('Invalid admin credentials');
      }

      const token = sign({ adminId: admin.id }, JWT_SECRET_ADMIN, { expiresIn: '8h' });
      return { token };
    },

    blockUser: async (_: any, { userId }: { userId: number }, context: any) => {
      if (!context.adminId) throw new Error('Admin access denied');
      return prisma.user.update({
        where: { id: userId },
        data: { isVerified: false },
        select: { id: true, login: true, email: true, isVerified: true },
      });
    },
  },
};