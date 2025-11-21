import {
  ActivityType,
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} from 'discord.js';
import { config } from '../../config/config.mjs';
import initCmdsAndEvents from '../handlers/index.mjs';
import { deployAppCommands } from '../functions/index.mjs';
// import { mongoose } from "../handlers/mongoose.mjs";
// import components from "../handlers/components.mjs";

export default class extends Client {
  collection = {
    interactioncommands: new Collection(),
    prefixcommands: new Collection(),
    aliases: new Collection(),
    components: {
      buttons: new Collection(),
      selects: new Collection(),
      modals: new Collection(),
    },
  };
  applicationcommandsArray = [];

  constructor() {
    super({
      intents: [Object.keys(GatewayIntentBits)],
      partials: [Object.keys(Partials)],
      presence: {
        activities: [
          {
            name: 'Name goes here...',
            type: ActivityType.Custom,
            state: 'Ready to d0xx!',
          },
        ],
      },
    });
  }

  start = async () => {
    initCmdsAndEvents(this);
    // components(this);
    // if (config.handler.mongodb.toggle) mongoose();
    await this.login(process.env.DISCORD_BOT_TOKEN || config.client.token);
    if (config.handler.deploy) deployAppCommands(this);
  };
}
