const { category } = require("./fish");

module.exports = {
  name: "ping",

  category: "other",

  description:
    "Kiểm tra độ trễ của bot và API.",

  async execute(message, args, client) {

    //
    // SEND MESSAGE
    //

    const sent = await message.reply(
      "🏓 Đang kiểm tra độ trễ..."
    );

    //
    // LATENCY
    //

    const latency =
      sent.createdTimestamp -
      message.createdTimestamp;

    //
    // API PING
    //

    const apiPing =
      Math.round(client.ws.ping);

    //
    // EDIT MESSAGE
    //

    await sent.edit(`
🏓 Pong!

📡 Client Latency:
${latency}ms

🌐 API Ping:
${apiPing}ms
`);
  },
};