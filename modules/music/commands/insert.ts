/**
 * /insert (query) (position)
 *
 * Inserts specified track/album to the position specified.
 *
 * Possible replies:
 * - Success with first added track info.
 * - Player does not exists.
 * - No track was added.
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

    const query = interaction.options.getString("query", true);
    const pos = interaction.options.getInteger("position", true);

    await interaction.deferReply();

    const player = controller.get(interaction.guild, interaction.channel);

    if (!player) {
        await interaction.editReply(replies.notExists());

        return;
    }

    const track = await player.add(query, interaction.user, pos - 1);

    await interaction.editReply(replies.appended(track));
}

const data = new SlashCommandBuilder()
    .setName("insert")
    .setDescription("Insert a new track to specific position in the queue.")
    .addStringOption((option) =>
        option.setName("query").setDescription("Title or URL of the song.").setRequired(true)
    )
    .addIntegerOption((option) =>
        option.setName("position").setDescription("Position to insert.").setRequired(true)
    )
    .setDMPermission(false);

export { data, execute };
