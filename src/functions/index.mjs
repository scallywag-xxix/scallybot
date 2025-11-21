import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import { join } from 'path';
import chalk from 'chalk';
import { REST, Routes } from 'discord.js';
import { config } from '../../config/config.mjs';

/**
 * Deploy application commands to Discord.
 * @param {ExtendedClient} client - The extended Discord client
 * @returns {Promise<void>} A promise that resolves when the deployment is complete.
 */
export async function deployAppCommands(client) {
  try {
    const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);
    log('Loading application commands...', 'warn');
    await rest.put(Routes.applicationCommands(config.client.id), {
      body: client.applicationcommandsArray,
    });
    log('Loaded all application commands successfully.', 'done');
  } catch (error) {
    log('Failed to load application commands.', 'err');
    throw error;
  }
}

/**
 * Recursively retrieves a list of module files with the specified extension in a directory.
 * @param {string} directory - The directory path to start the search from.
 * @param {string} [extension='.mjs'] - The file extension to filter by (e.g., '.mjs').
 * @param {string} [currentModuleURL=process.cwd()] - The URL of the current module.
 * @returns {string[]} An array of relative file paths to the module files found.
 */
export function getModuleFilesRecursively(directory, extension = '.mjs') {
  let files = [];
  const items = readdirSync(directory, { withFileTypes: true });
  items.forEach((item) => {
    const fullPath = join(directory, item.name);
    if (item.isDirectory()) {
      const nestedFiles = getModuleFilesRecursively(fullPath, extension);
      files = files.concat(nestedFiles);
    } else if (item.isFile() && item.name.endsWith(extension)) {
      files.push(fullPath);
    }
  });
  return files;
}

/**
 * Loads and registers a command or event module.
 * @param {Client} client The Discord client
 * @param {string} file The file path of the module
 * @param {string} type The type ("commands" or "events")
 * @returns {object|null} The data of the loaded module or null if invalid
 */
export async function loadCommandOrEvent(client, file, type) {
  try {
    let data;
    const moduleFile = pathToFileURL(file);
    const { default: module } = await import(moduleFile);
    const isValidModule = _validateDiscordModule(module);

    if (isValidModule) {
      switch (type) {
      case 'events':
        if (module.once) {
          client.once(module.event, (...args) =>
            module.execute(client, ...args)
          );
        } else {
          client.on(module.event, (...args) =>
            module.execute(client, ...args)
          );
        }
        break;
      case 'slash':
      case 'prefix':
        type = 'prefixcommands';
        client.collection[type].set(module.data.name, module);
        break;
      default:
        // const aliases = module.data.aliases ?? [];
        // aliases.forEach((alias) => {
        //     client.collection.aliases.set(alias, module.data.name);
        // });
        // type = 'interactioncommands';
        // client.collection[type].set(module.data.name, module);
        // client.applicationcommandsArray.push(data);
        break;
      }
      log(
        `Loaded the following ${type} successfully: ${file.split('/').pop()}`,
        'info'
      );
      return data; // Return valid module data
    }
    log(`Unable to load the following command(s): ${file}`, 'warn');
    return null; // Return null for invalid module
  } catch (error) {
    log(
      `Error loading '${type}' module from ${file}: error: ${error.message}`,
      'err'
    );
    throw error; // Re-throw the error for further handling
  }
}

/**
 * Logs a message with a specified style.
 *
 * @param {string} string - The message to be logged.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
export function log(string, style) {
  const styles = {
    info: { prefix: chalk.blue('[INFO]'), logFunction: console.log },
    err: { prefix: chalk.red('[ERROR]'), logFunction: console.error },
    warn: { prefix: chalk.yellow('[WARNING]'), logFunction: console.warn },
    done: { prefix: chalk.green('[SUCCESS]'), logFunction: console.log },
  };

  const selectedStyle = styles[style] || { logFunction: console.log };
  selectedStyle.logFunction(`${selectedStyle.prefix || ''} ${string}`);
}

/**
 *
 * @param {number} time
 * @param {import('discord.js').TimestampStylesString} style
 * @returns {`<t:${string}>`}
 */
export function time(time, style) {
  return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ''}>`;
}

/**
 * Validates a function module to ensure it has required properties.
 *
 * @param {Object} moduleToValidate - The module to be validated.
 * @returns {boolean} - Whether the module is valid (has required properties).
 * @throws {Error} - If the module is not an object or has missing required properties.
 */
function _validateDiscordModule(moduleToValidate) {
  let requiredProperties = ['data', 'execute'];
  try {
    if (typeof moduleToValidate !== 'object') {
      throw new Error('The provided module is not an object.');
    }

    if (moduleToValidate.event) {
      requiredProperties = ['event', 'execute'];
    }
    const missingProperties = requiredProperties.filter(
      (prop) => !moduleToValidate[prop]
    );
    if (missingProperties.length > 0) {
      const missingPropsString = missingProperties.join(', ');
      const errorText =
        missingProperties.length === 1
          ? 'is missing the required property'
          : 'are missing the required properties';
      throw new Error(
        `The provided module '${moduleToValidate.data.name}' ${errorText}: ${missingPropsString}`
      );
    }
    return true;
  } catch (error) {
    log(`functions/index.mjs error: ${error.message}`, 'err');
    return false;
  }
}