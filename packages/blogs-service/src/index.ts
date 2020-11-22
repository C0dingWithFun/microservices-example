import express from 'express';
import amqp from 'amqplib/callback_api';
import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';

const main = async () => {
  const app = express();

  app.get('/', (_, res) => {
    res.json({
      message: 'Hello from blogs services!',
    });
  });

  app.get('/events', (req, res) => {
    const username = req.params.username || 'helloWorld';
    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        // var queue = 'blogs.queue';
        var msg = username;

        channel.assertExchange('blogs.exchange', 'fanout', { durable: false });

        channel.publish('blogs.exchange', '', Buffer.from(msg));
        console.log(' [x] Sent %s', msg);
      });

      setTimeout(function () {
        connection.close();
      }, 1000);
    });
    res.json({
      message: 'Blog Event Sent!',
    });
  });

  // Construct a schema, using GraphQL schema language
  const typeDefs = gql`
    extend type Query {
      helloBlog: String
    }
  `;

  // Provide resolver functions for your schema fields
  const resolvers = {
    Query: {
      helloBlog: () => 'Hello world from Blogs!',
    },
  };

  const schema = buildFederatedSchema([{ typeDefs, resolvers }]);

  const server = new ApolloServer({
    schema,
  });

  server
    .listen(4003)
    .then(() => console.log('blog service has started listening on 4003'));
};

main();
