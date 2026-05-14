const katakana = require("../data/katakana");

module.exports = {
  name: "katakana",

  category: "quiz",

  description:
    "Quiz Katakana - Học bảng chữ cái Katakana bằng cách trả lời câu hỏi.",

  async execute(message) {

    //
    // START MESSAGE
    //

    await message.reply(
      "🇯🇵 Bắt đầu quiz Katakana!\n\nGõ `stop` để dừng."
    );

    //
    // FILTER
    //

    const filter = m =>
      m.author.id === message.author.id;

    //
    // SCORE
    //

    let score = 0;

    //
    // QUIZ LOOP
    //

    while (true) {

      //
      // RANDOM QUESTION
      //

      const random =
        katakana[
          Math.floor(
            Math.random() * katakana.length
          )
        ];

      await message.channel.send(
        `Kana: **${random.kana}**`
      );

      //
      // WAIT ANSWER
      //

      const collected =
        await message.channel.awaitMessages({
          filter,
          max: 1,
          time: 30000,
        });

      //
      // TIMEOUT
      //

      if (!collected.size) {

        await message.channel.send(
          `⏰ Hết thời gian.\n

📖 Đáp án:
${random.kana} = ${random.romaji}\n

🏆 Score cuối: ${score}`
        );

        break;
      }

      //
      // ANSWER
      //

      const answer = collected
        .first()
        .content
        .toLowerCase();

      //
      // STOP COMMAND
      //

      const stopWords = [
        "stop",
        "quit",
        "exit",
        "cancel",
      ];

      if (stopWords.includes(answer)) {

        await message.channel.send(
          `🛑 Đã dừng quiz.\n

📖 Đáp án câu hiện tại:
${random.kana} = ${random.romaji}\n

🏆 Score cuối: ${score}`
        );

        break;
      }

      //
      // CHECK ANSWER
      //

      if (answer === random.romaji) {

        score++;

        await message.channel.send(
          `✅ Chính xác!\n🏆 Score: ${score}`
        );

      } else {

        await message.channel.send(
          `❌ Sai!\n

📖 Đáp án đúng:
${random.kana} = ${random.romaji}\n

🏆 Score: ${score}`
        );
      }
    }
  },
};