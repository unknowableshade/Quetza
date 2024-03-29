/**
 * /play <query>
 *
 * Starts up the Player.
 * If query provided searches corresponding track/album and adds it to the queue end.
 *
 * Possible replies:
 * - Success with first added track info.
 * - Denies if requester is not connected to the Voice Channel.
 * - No track was added, but player was set.
 */
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

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

    const query = interaction.options.getString("query");

    if (query) {
        await interaction.reply(replies.searching());
    } else {
        await interaction.deferReply();
    }

    const player =
        controller.get(interaction.guild, interaction.channel) ??
        controller.set(interaction.guild, interaction.channel);

    const channel = interaction.member.voice.channel;

    if (!channel) {
        controller.delete(interaction.guildId);

        await interaction.editReply(replies.notConnected());

        return;
    }

    player.connect(channel);

    if (query) {
        const track = await player.add(query, interaction.user);

        await interaction.editReply(replies.appended(track));
    }

    if (!player.resource) {
        await player.play();
    }
}

const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Launch player and add songs to the queue.")
    .addStringOption((option) =>
        option.setName("query").setDescription("Title or URL of the song.")
    )
    .setDMPermission(false);

export { data, execute };
