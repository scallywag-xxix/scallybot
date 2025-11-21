import fs from 'fs';
import { Events } from 'discord.js';
import { log } from '../../functions/index.mjs';
import { config } from '../../../config/config.mjs';

export default {
  event: Events.MessageCreate,
  on: true,
  async execute(client, message) {
    try {
      const data = {
        author: message.author.tag,
        channel: message.channel.name,
        content: message.content,
        server: message.guild ? message.guild.name  : 'DM (Direct Message)',
        time: message.createdAt.toISOString()
      };
      _logDiscordMessageContent(data);
    } catch (err) {
      log(`message failed. error: ${err}`, 'error');
    }
  }
};

function _logDiscordMessageContent(data) {
  const { author, channel, content, server, time } = data;
  const logName = `${time.split('T')[0]}_discord.log`;
  const logPath = config.logger.filePath || './logs/';
  const logFilePath = `${logPath}${logName}`;
  const logEntry = `[${time}][${server}][${channel}][${author}]: ${content}\n`;
  log(logEntry, 'info');
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
}