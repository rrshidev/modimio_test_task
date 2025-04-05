import { ApolloServer } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { adminResolvers } from './graphql/resolvers/admin.resolver';
import { userResolvers } from './graphql/resolvers/user.resolver';
import { typeDefs } from './graphql/schema';
import { mergeResolvers } from '@graphql-tools/merge'; // Добавьте этот импорт

const prisma = new PrismaClient();
const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN || 'admin-secret-123';
const JWT_SECRET_USER = process.env.JWT_SECRET_USER || 'user-secret-123';

const resolvers = mergeResolvers([adminResolvers, userResolvers]);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization?.split(' ')[1];
    let adminId: number | null = null;
    let userId: number | null = null;
    
    if (token) {
      try {
        const adminDecoded = verify(token, JWT_SECRET_ADMIN) as { adminId: number };
        adminId = adminDecoded.adminId;
      } catch (e) {
        try {
          const userDecoded = verify(token, JWT_SECRET_USER) as { userId: number };
          userId = userDecoded.userId;
        } catch (e) {
          console.warn('Invalid token');
        }
      }
    }

    return { prisma, adminId, userId };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});