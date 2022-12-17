const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Retorunea pong!'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
