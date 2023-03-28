import { generateDependencyReport } from "@discordjs/voice";
import { ActivityType } from "discord.js";

import Client from "../../../lib/client.js";

async function execute(client: Client): Promise<void> {
    if (!client.user || !client.application) {
        throw new Error("No application or user for it is provided.");
    }

    console.log(generateDependencyReport());
    console.log(client.generateApplicationStatus());

    client.user.setActivity("over you", { type: ActivityType.Watching });

    const restCommands = Array.from(client.commands.values()).map((value) => value.data);

    client.application.commands.set(restCommands);
}

const name = "ready";

export { execute, name };