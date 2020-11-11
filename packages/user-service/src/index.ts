import express from 'express';
import amqp from 'amqplib/callback_api';

const app = express();

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'blogs';

    channel.assertQueue(queue, {
      durable: false,
    });

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    channel.consume(
      queue,
      function (msg) {
        setTimeout(function () {
          console.log(' [x] Received %s', msg?.content?.toString());
        }, 7000);
      },
      {
        noAck: true,
      }
    );
  });
});

app.get('/', (_, res) => {
  res.json({
    message: 'Hello from users services!',
  });
});

app.get('/events', (_, res) => {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'blogs';
      var msg = 'Hello world from blog!';

      channel.assertQueue(queue, {
        durable: false,
      });

      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(' [x] Sent %s', msg);
    });

    connection.close();
  });
  res.json({
    message: 'Blog Event Sent!',
  });
});

app.listen(4001, () =>
  console.log('users service has started listening on 4001')
);
