import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { ApolloServer } from 'apollo-server-lambda';
import { buildFederatedSchema } from '@apollo/federation';

import { Resolvers } from './schemaTypes';
import typeDefs from './schema.graphql';

export interface AppGraphQLContext {
  userID: String;
}

const resolvers: Resolvers = {
  Query: {
    game: (root, args, context) => {
      return {
        id: '123ID',
        name: 'Apex Legends',
        covers: {
          cover: 'url',
          screenshotMed: 'url',
          screenshotBig: 'url',
          screenshotHuge: 'url',
          logo: 'url'
        }
      };
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]),
  debug: process.env.APP_ENV === 'prod' ? false : true,
  context: ({ event }): AppGraphQLContext => {
    const userID = event.headers?.['user-id'];
    return { userID };
  }
});

export const handler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  server.createHandler({
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  })(event, context, (_err: any, data: any) => {
    callback(null, data);
  });
};
