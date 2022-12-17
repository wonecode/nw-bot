const { SlashCommandBuilder } = require('discord.js');
const { supabase } = require('../../supabase');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const { factions } = require('../utils/factions.js');
const { weapons } = require('../utils/weapons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription("Rettournes les informations d'un joueur.")
    .addStringOption((option) =>
      option.setName('username').setDescription('Le pseudo IG du joueur').setRequired(true)
    ),
  async execute(interaction) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('ig_username', interaction.options.getString('username'));

    const player = JSON.parse(JSON.stringify(data[0]));

    const playerEmbed = new EmbedBuilder()
      .setColor(factions[player.faction].color)
      .setAuthor({
        name: player.ig_username,
        iconURL: factions[player.faction].icon,
        url: 'https://nw-wartool.vercel.app/',
      })
      .setDescription(`*${factions[player.faction].name} - ${player.guild}*`)
      .addFields(
        { name: 'Gearscore', value: player.gearscore.toString() },
        { name: 'Première arme', value: weapons[player.first_weapon].label, inline: true },
        { name: 'Deuxième arme', value: weapons[player.second_weapon].label, inline: true },
      )
      .setFooter({
        text: `Joueur ajouté le ${moment(player.created_at).locale('fr').format('D MMMM YYYY')}`,
      });

    if (player.third_weapon !== 'none') {
      playerEmbed.addFields({
        name: 'Troisième arme',
        value: weapons[player.third_weapon].label,
        inline: true,
      });
    }

    if (error) {
      console.log(error);
    } else {
      return interaction.reply({ embeds: [playerEmbed] });
    }
  },
};
