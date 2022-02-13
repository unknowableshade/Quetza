import { quetzaConfig } from "../../../config";

import {
    ButtonInteraction, ColorResolvable,
    CommandInteraction, Message, MessageActionRow,
    MessageButton, MessageEmbed
} from "discord.js";

import { QuetzaClient } from "../../../assets/QuetzaClient";
import { queueDesigner } from "../assets/Misc"


export async function run(client: QuetzaClient, ctx: CommandInteraction) {
    if (ctx.guild === null)
        return;

    const player = client.Modules["music"].control.getPlayer(ctx.guild.id);

    if (!player)
        return;

    await ctx.deferReply();
    const queue = player.Queue;

    if (queue.length === 0) {
        const embed = new MessageEmbed()
            .setColor(quetzaConfig.color as ColorResolvable)
            .setTitle("Queue is empty.");

        await ctx.editReply({ embeds: [embed] });
        return;
    }

    let page = 0;
    const maxPage = Math.floor(queue.length / 11);

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("QueueTop")
                .setLabel("TOP")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("QueueUp")
                .setLabel("UP")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("QueueDown")
                .setLabel("DOWN")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("QueueEnd")
                .setLabel("END")
                .setStyle("SECONDARY")
        );

    const message = await ctx.editReply({
        embeds: [ queueDesigner(queue, page, player.NowPlaying, player.NowPlayingPos) ],
        components: [row]
    }) as Message;

    const collector = message.createMessageComponentCollector({ time: 15000 });

    collector.on("collect", async (btn: ButtonInteraction) => {
        console.log(page);
        switch (btn.customId) {
            case "QueueTop": { page = 0; break; }
            case "QueueUp": { page = Math.max(page - 1, 0); break; }
            case "QueueDown": { page = Math.min(page + 1, maxPage); break; }
            case "QueueEnd": page = maxPage;
        }

        await btn.update({
            embeds: [ queueDesigner(queue, page, player.NowPlaying, player.NowPlayingPos) ]
        });
    });
}

const data = {
    name: "queue",
    description: "Send player queue.",
}

export { data }