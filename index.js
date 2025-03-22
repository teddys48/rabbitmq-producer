const express = require("express");
const app = express();
const dotenv = require("dotenv");
const amqp = require("amqplib");
dotenv.config();

app.use(express.json());

const { port, rabbitmq } = process.env;
// console.log(rabbitmq);
amqp
  .connect(rabbitmq)
  .then((connection) => {
    connection
      .createChannel()
      .then(async (channel) => {
        channel = channel;
        console.log("channel is ready");
        await channel.assertExchange("notif", "direct", { durable: true });
        await channel.assertQueue("email", { durable: true });
        await channel.bindQueue("email", "notif", "email");

        app.get("/rabbitmq/send-notif-email", (req, res) => {
          try {
            let { message } = req.query;
            channel.publish("notif", "email", Buffer.from(message));
            res.json("success");
          } catch (error) {
            res.json(error.message);
          }
        });
      })
      .catch((err) => {
        console.log("err channel", err.message);
      });
  })
  .catch((err) => {
    console.log("error", err.message);
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
