import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Admin {
    id: ID!
    email: String!
  }

  type User {
    id: ID!
    login: String!
    email: String!
    isVerified: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User
    admin: Admin
  }

  type Query {
    users(search: String, page: Int, limit: Int): [User!]!
    adminProfile: Admin!
    me: User!
  }

  type Mutation {
    adminLogin(email: String!, password: String!): AuthPayload!
    register(login: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!  # Добавлен вход для пользователей
    blockUser(userId: ID!): User!
  }
`;