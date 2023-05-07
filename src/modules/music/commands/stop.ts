import { Interaction, SlashCommandBuilder, TextChannel } from "discord.js";

import Client from "../../../lib/client.js";
import replies from "../lib/replies.js";
import { controller } from "../module.js";

async function execute(client: Client, interaction: Interaction) {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) {
        return;
    }

    const player = controller.get(interaction.guild.id, interaction.channel as TextChannel);

    if (!player) {
        await interaction.reply(replies.notExists());

        return;
    }

    player.destroy();

    await interaction.reply(replies.destroyed());
}

const data = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Destroy the player.")
    .setDMPermission(false);

export { data, execute };
