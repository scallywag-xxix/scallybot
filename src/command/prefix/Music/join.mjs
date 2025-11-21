import { EmbedBuilder } from 'discord.js';
import { log } from '../../../functions/index.mjs';

export default {
  data: {
    name: 'Join',
    aliases: ['j', 'join'],
    description: 'Joins the Voice Channel.',
    usage: 'Join',
  },
  async execute(interaction) {
    const { member, guild } = interaction;

    try {
      // Check if the interaction was sent in a guild (server)
      if (!guild) throw new Error('You can only use this command in a server.');

      // Check if the member and the bot have the necessary privileges
      const authorVoiceChannel = member.voice.channel;
      const botVoiceChannel = guild.me.voice.channel;

      if (!authorVoiceChannel || !botVoiceChannel) {
        throw new Error(
          'Both you and I must be in a voice channel to use this command.'
        );
      }

      if (authorVoiceChannel.id !== botVoiceChannel.id) {
        throw new Error(
          'You need to be in the same voice channel as me to use this command.'
        );
      }

      // Check if the command matches one of the aliases
      const commandName = interaction.commandName.toLowerCase();
      if (!this.data.aliases.includes(commandName)) {
        throw new Error(
          `This command is not recognized. Please use one of the following aliases: ${this.data.aliases.join(', ')}`
        );
      }

      // Join the author's voice channel
      await authorVoiceChannel.join();
      interaction.reply(`Joined ${authorVoiceChannel.name}.`);
    } catch (error) {
      log(`join.mjs error: ${error.message}`, 'err');
      interaction.reply(`An error occurred: ${error.message}`);
    }
  },
  async tempExecute(interaction) {
    const { member } = interaction;

    new EmbedBuilder({
      author: member.author,
      description: 'This is a join confirmation description.',
      title: 'Join Confirmation Title',
      color: 'purple',
      footer: 'This is a join confirmation footer',
      url: 'https://me.io',
      // video: ''
    });
  },
};

// run: async (client, message, args) => {

//     if (!message.guild.me.voice.channel) {
//         message.member.voice.channel.join();

//         let thing = new MessageEmbed()
//             .setColor(message.guild.me.displayHexColor)
//             .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
//             .setDescription("**Join** the voice channel.")
//             .setFooter(`Request by: ${message.author.tag}`, message.author.displayAvatarURL());
//         return message.channel.send(thing);
//     } else {
//         if (message.guild.me.voice.channel !== message.member.voice.channel) {
//             let thing = new MessageEmbed()
//                 .setColor("RED")
//                 .setDescription(`You must be in the same channel as ${message.client.user}`);
//             return message.channel.send(thing)
//         }
//     }
// }
