// src/commands/biomes.js

const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');

const fishes =
    require('../data/fishes.json');

const biomes =
    require('../data/biomes.json');

module.exports = {

    name: 'biomes',

    aliases: ['biome'],

    description:
        'Xem danh sách biome',

    category: 'fish',

    async execute(message) {

        //
        // MAIN EMBED
        //

        const embed =
            new EmbedBuilder()

                .setTitle(
                    '🌊 Fishing Biomes'
                )

                .setDescription(

                    biomes.map(biome => {

                        return (

                            `${biome.emoji} ` +

                            `**${biome.name}**\n` +

                            `🔓 Level: ${biome.requiredLevel}\n` +

                            `📝 ${biome.description}`

                        );

                    }).join('\n\n')
                )

                .setColor('Blue')

                .setFooter({

                    text:
                        'Chọn biome bên dưới để xem thông tin cá'
                });

        //
        // DROPDOWN
        //

        const menu =
            new StringSelectMenuBuilder()

                .setCustomId(
                    'biome_select'
                )

                .setPlaceholder(
                    'Chọn biome'
                )

                .addOptions(

                    biomes.map(biome => ({

                        label:
                            biome.name,

                        description:
                            `Level ${biome.requiredLevel}`,

                        emoji:
                            biome.emoji,

                        value:
                            biome.id
                    }))
                );

        const row =
            new ActionRowBuilder()

                .addComponents(menu);

        //
        // SEND
        //

        const msg =
            await message.reply({

                embeds: [embed],

                components: [row]
            });

        //
        // COLLECTOR
        //

        const collector =
            msg.createMessageComponentCollector({

                time:
                    1000 * 60 * 5
            });

        collector.on(

            'collect',

            async interaction => {

                //
                // ONLY AUTHOR
                //

                if (

                    interaction.user.id !==
                    message.author.id

                ) {

                    return interaction.reply({

                        content:
                            '❌ Đây không phải menu của bạn',

                        ephemeral: true
                    });
                }

                //
                // BIOME
                //

                const biomeId =
                    interaction.values[0];

                const biome =
                    biomes.find(

                        b => b.id === biomeId
                    );

                //
                // FISHES
                //

                const biomeFish =
                    fishes.filter(

                        fish =>

                            fish.biomes.includes(
                                biomeId
                            )
                    );

                //
                // TOTAL WEIGHT
                //

                const totalWeight =
                    biomeFish.reduce(

                        (acc, fish) =>

                            acc +
                            fish.baseChance,

                        0
                    );

                //
                // FISH TEXT
                //

                const fishText =
                    biomeFish

                        .sort(

                            (a, b) =>

                                b.baseChance -
                                a.baseChance
                        )

                        .map(fish => {

                            //
                            // RATE
                            //

                            const percent = (

                                (
                                    fish.baseChance /
                                    totalWeight
                                ) * 100

                            ).toFixed(2);

                            //
                            // EMOJI
                            //

                            let emoji = '⚪';

                            switch (
                                fish.rarity
                            ) {

                                case 'Rare':
                                    emoji = '🟦';
                                    break;

                                case 'Epic':
                                    emoji = '🟪';
                                    break;

                                case 'Legendary':
                                    emoji = '🟨';
                                    break;

                                case 'Mythic':
                                    emoji = '🟥';
                                    break;
                            }

                            return (

                                `${emoji} ` +

                                `**${fish.name}** ` +

                                `(${fish.rarity})\n` +

                                `📊 Rate: ${percent}%\n` +

                                `💰 Base Value: ${fish.value}$\n` +

                                `⭐ XP: ${fish.xp}\n` +

                                `📏 Size: ${fish.minSize}-${fish.maxSize}cm`

                            );

                        })

                        .join('\n\n');

                //
                // EMBED
                //

                const biomeEmbed =
                    new EmbedBuilder()

                        .setTitle(

                            `${biome.emoji} ${biome.name}`

                        )

                        .setDescription(

                            `📝 ${biome.description}\n\n` +

                            `🔓 Required Level: ` +

                            `**${biome.requiredLevel}**\n\n` +

                            fishText
                        )

                        .setColor('Aqua');

                //
                // UPDATE
                //

                await interaction.update({

                    embeds: [biomeEmbed],

                    components: [row]
                });
            }
        );

        //
        // END
        //

        collector.on(

            'end',

            async () => {

                try {

                    const disabledMenu =

                        StringSelectMenuBuilder

                            .from(menu)

                            .setDisabled(true);

                    const disabledRow =
                        new ActionRowBuilder()

                            .addComponents(
                                disabledMenu
                            );

                    await msg.edit({

                        components: [
                            disabledRow
                        ]
                    });

                } catch (err) {

                    console.error(err);
                }
            }
        );
    }
};
