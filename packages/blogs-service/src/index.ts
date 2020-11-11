import express from 'express';
import amqp from 'amqplib/callback_api';

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
      var queue = 'blogs';
      var msg = username;

      channel.assertQueue(queue, {
        durable: false,
      });

      channel.sendToQueue(queue, Buffer.from(msg));
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

app.listen(4000, () =>
  console.log('blog service has started listening on 4000')
);
