const {
    SlashCommandBuilder,
} = require("discord.js");

const katakana = require("../data/katakana");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kataquiz")
        .setDescription("Quiz katakana vô hạn"),

    async execute(interaction) {

        await interaction.reply(
            "🇯🇵 Bắt đầu quiz katakana!\n\nGõ `stop` để dừng."
        );

        const filter = m =>
            m.author.id === interaction.user.id;

        let score = 0;

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

            await interaction.followUp(
                `Kana: **${random.kana}**`
            );

            //
            // WAIT ANSWER
            //

            const collected =
                await interaction.channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                });

            //
            // TIMEOUT
            //

            if (!collected.size) {
                await interaction.followUp(
                    `⏰ Hết thời gian.\n
📖 Đáp án câu hiện tại:
${random.kana} = ${random.romaji}\n
Score cuối: ${score}`
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

                await interaction.followUp(
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

                await interaction.followUp(
                    `✅ Chính xác!\nScore: ${score}`
                );

            } else {

                await interaction.followUp(
                    `❌ Sai!\nĐáp án đúng: ${random.romaji}\nScore: ${score}`
                );
            }
        }
    },
};