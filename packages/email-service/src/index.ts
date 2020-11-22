import express from 'express';
import amqp from 'amqplib/callback_api';
import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'blogs';
    channel.assertExchange('blogs.exchange', 'fanout', { durable: false });
    channel.assertQueue(
      '',
      {
        exclusive: true,
      },
      function (error2, q) {
        if (error2) {
          throw error2;
        }
        console.log(
          ' [*] Waiting for messages in %s. To exit press CTRL+C',
          queue
        );
        channel.bindQueue(q.queue, 'blogs.exchange', '');

        channel.consume(
          q.queue,
          function (msg) {
            setTimeout(function () {
              console.log(' [x] Received %s', msg?.content?.toString());
            }, 3000);
          },
          {
            noAck: false,
          }
        );
      }
    );
  });
});
const main = async () => {
  const app = express();

  app.get('/', (_, res) => {
    res.json({
      message: 'Hello from email services!',
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
      message: 'User Event Sent!',
    });
  });

  // Construct a schema, using GraphQL schema language
  const typeDefs = gql`
    extend type Query {
      helloEmail: String
    }
  `;

  // Provide resolver functions for your schema fields
  const resolvers = {
    Query: {
      helloEmail: () => 'Hello world from Email!',
    },
  };

  const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  });

  server
    .listen(4001)
    .then(() => console.log('email service has started listening on 4001'));
};

main();
