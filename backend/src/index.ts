import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { AppDataSource } from './config/dataSource';
import { connectElasticSearch } from './elasticsearch/client';
import { startKafkaConsumer } from './kafka/consumer';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  // Initialize PostgreSQL connection
  await AppDataSource.initialize();
  console.log('PostgreSQL connected');

  // Initialize ElasticSearch connection
  await connectElasticSearch();
  console.log('ElasticSearch connected');

  // Start Kafka consumer
  await startKafkaConsumer();
  console.log('Kafka consumer started');

  // Create Express app
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create Apollo GraphQL server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
  });

  await apolloServer.start();

  // Mount GraphQL middleware at /graphql
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Extract JWT token from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '') || '';
        return { token };
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL Playground at http://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
