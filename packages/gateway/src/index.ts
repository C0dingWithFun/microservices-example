import { ApolloServer } from 'apollo-server';
import { ApolloGateway } from '@apollo/gateway';

(async () => {
  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'blog', url: 'http://localhost:4003/graphql' },
      { name: 'email', url: 'http://localhost:4001/graphql' },
      { name: 'user', url: 'http://localhost:4002/graphql' },
    ],
  });

  // const {} = await gateway.load();

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
    engine: false,
  });

  server.listen(4000).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
