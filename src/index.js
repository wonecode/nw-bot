const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  EmbedBuilder,
} = require('discord.js');
const { supabase } = require('../supabase');
const moment = require('moment');
const { embed } = require('./commands/balance');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once(Events.ClientReady, (c) => {
  client.user.setPresence({ activities: [{ name: 'New World' }] });

  const whatsup = client.channels.cache.get(`1054714484939305000`);

  setInterval(async () => {
    if (moment().locale('fr').format('HH:mm') === '16:30') {
      await whatsup.send(
        "Salut tout le monde ! Quoi de neuf de prévu sur le jeu aujourd'hui ? *(c'est pas parce que je suis un bot que ça t'empêche de répondre hein :wink:)* @everyone"
      );
    }
  }, 10000);

  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'updateBalance') {
      const modal = new ModalBuilder()
        .setCustomId('updateBalanceModal')
        .setTitle('Mettre à jour le solde de la trésorerie')
        .addComponents([
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('balanceInput')
              .setLabel('Nouveau solde')
              .setStyle(TextInputStyle.Short)
              .setMinLength(3)
              .setMaxLength(9)
              .setPlaceholder('43627.27')
              .setRequired(true)
          ),
        ]);

      await interaction.showModal(modal);
    }
  }

  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === 'updateBalanceModal') {
      const response = Number(interaction.fields.getTextInputValue('balanceInput'));
      const updatedDate = moment().utc().format();

      console.log(response);

      const { error } = await supabase
        .from('balance')
        .update({ count: response, updated_at: updatedDate })
        .eq('id', 1);

      const successEmbed = new EmbedBuilder()
        .setTitle('Mise à jour du solde')
        .setColor('#2ecc71')
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.avatarURL({ dynamic: true }),
        })
        .setTimestamp();

      if (error) {
        console.log(error);
        await interaction.reply({
          content: 'Une erreur est survenue lors de la mise à jour du solde.',
          ephemeral: true,
        });
      }

      const channel = client.channels.cache.get(`1054848145877643325`);
      const message = await channel.messages.fetch(`1055843687390793758`);

      const { data: lastTransactionData } = await supabase
        .from('balance_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      message.edit({
        embeds: [
          embed({
            balance: response,
            last_transaction: lastTransactionData[0],
            updated_date: updatedDate,
          }).toJSON(),
        ],
      });

      await interaction.reply({
        embeds: [
          successEmbed
            .setDescription(
              `Le solde a bien été mis à jour à **${response.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}**`
            )
            .toJSON(),
        ],
        ephemeral: true,
      });
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Aucune commande appelée ${interaction.commandName} n'a été trouvée.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Une erreur est survenue lors de l'exécution de cette commande.",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
