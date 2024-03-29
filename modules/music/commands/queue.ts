/**
 * /queue
 *
 * Replies interactive queue with current playing track at the top and 10 tracks from queue on each page.
 * Interactiveness provided by buttons:
 * - First page.
 * - Previous page.
 * - Next page.
 * - Last page.
 *
 * Buttons live up to 30 seconds.
 *
 * Possible replies:
 * - Success with interactive queue.
 * - Player does not exists.
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageActionRowComponentBuilder,
    SlashCommandBuilder
} from "discord.js";

import Client from "$lib/client.js";
import logger from "$lib/logger.js";
import Music from "$mlib/music.js";

import replies from "../lib/replies.js";

async function execute(
    _: Client,
    interaction: ChatInputCommandInteraction,
    controller: Music
): Promise<void> {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild() || !interaction.channel) {
        logger.warn("Interaction rejected.", { interaction });

        return;
    }

    await interaction.deferReply();

    const player = controller.get(interaction.guild, interaction.channel);

    if (!player) {
        await interaction.editReply(replies.notExists());

        return;
    }

    if (player.queue.empty()) {
        await interaction.editReply(replies.queue(player.queue));

        return;
    }

    let position = 1;

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder().setCustomId("Top").setLabel("🔼").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("Up").setLabel("🔺").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("Down").setLabel("🔻").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("End").setLabel("🔽").setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.editReply({
        ...replies.queue(player.queue, 0, player.resource),
        components: [row]
    });

    const collector = message.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async (btn: ButtonInteraction) => {
        switch (btn.customId) {
            case "Top": {
                position = 1;
                break;
            }
            case "Up": {
                position = Math.max(position - 10, 1);
                break;
            }
            case "Down": {
                position = Math.min(
                    position + 10,
                    Math.floor(player.queue.tracks.length / 10) * 10
                );
                break;
            }
            case "End": {
                position = Math.floor(player.queue.tracks.length / 10) * 10;
            }
        }

        await btn.update(replies.queue(player.queue, position - 1, player.resource));
    });
}

const data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Print interactive queue pointing to current track.")
    .setDMPermission(false);

export { data, execute };
