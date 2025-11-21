import { MessageEmbed } from 'discord.js';
import { config } from '../../../../config/config.mjs';

export const helpCommand = {
  info: {
    name: 'help',
    description: 'To show all commands',
    usage: '[command]',
    aliases: ['commands', 'help me', 'pls help'],
  },

  run: async function(client, message, args) {
    let allCmds = '';
    const prefix = client.config.prefix ? client.config.prefix || config.handler.prefix : '';
    client.commands.forEach((cmd) => {
      const cmdinfo = cmd.info;
      allCmds +=
        '`' +
        prefix +
        cmdinfo.name +
        ' ' +
        cmdinfo.usage +
        '` ~ ' +
        cmdinfo.description +
        '\n';
    });

    const embed = new MessageEmbed()
      .setAuthor('Commands of ' + client.user.username)
      .setColor(message.guild.me.displayHexColor)
      .setDescription(allCmds)
      .setFooter(
        `To get info of each command you can do ${prefix}help [command]`,
      );

    if (!args[0]) {
      return message.channel.send(embed);
    } else {
      const cmd = args[0];
      let command = client.commands.get(cmd);
      if (!command) command = client.commands.find((x) => x.info.aliases.includes(cmd));
      if (!command) return message.channel.send('Unknown Command');
      const commandinfo = new MessageEmbed()
        .setTitle('Command: ' + command.info.name + ' info')
        .setColor(message.guild.me.displayHexColor).setDescription(`
Name: ${command.info.name}
Description: ${command.info.description}
Usage: \`\`${prefix}${command.info.name} ${command.info.usage}\`\`
Aliases: ${command.info.aliases.join(', ')}
`);
      message.channel.send(commandinfo);
    }
  },
};
