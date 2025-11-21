import { EmbedBuilder } from 'discord.js';
import { config } from '../../../../config/config.mjs';
// const GuildSchema = require('../../../schemas/GuildSchema');

export default {
  data: {
    name: 'help',
    description: 'The help menu for all possible commands.',
    aliases: ['h'],
    cooldown: 15000,
  },
  // eslint-disable-next-line no-unused-vars
  async execute(client, message, args) {
    let prefix = config.handler.prefix;
    // if (config.handler?.mongodb?.toggle)
    const mapIntCmds = client.applicationcommandsArray.map(
      (v) => `\`/${v.name}\`: ${v.description || '(No description)'}`
    );
    const mapPreCmds = client.collection.prefixcommands.map(
      (v) =>
        `\`${prefix}${v.data.name}\` (${
          v.data.aliases.length > 0
            ? v.data.aliases.map((a) => `**${a}**`).join(', ')
            : 'None'
        }): ${v.data.description || '(No description)'}`
    );
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Help command')
          .addFields(
            { name: 'Slash commands', value: `${mapIntCmds.join('\n')}` },
            { name: 'Prefix commands', value: `${mapPreCmds.join('\n')}` }
          ),
      ],
    });
  },
};
