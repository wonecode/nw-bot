// const { SlashCommandBuilder } = require('discord.js');
// const { EmbedBuilder } = require('discord.js');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('send-message')
//     .setDescription('Send a message to a channel')
//     .addChannelOption((option) =>
//       option
//         .setName('channel')
//         .setDescription('The channel to send the message to')
//         .setRequired(true)
//     ),
//   async execute(interaction) {
//     const channel = interaction.options.getChannel('channel');

//     const embed = new EmbedBuilder()
//       .setTitle('Nouvelle fonctionnalité')
//       .setColor('#9b59b6')
//       .setFooter({
//         text: interaction.user.username,
//         iconURL: interaction.user.avatarURL({ dynamic: true }),
//       })
//       .setDescription(
//         `Vous pouvez désormais modifier vos informations sur le GuildTool en utilisant la commande \`/edit\` \n`
//       )
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//     await channel.send({ embeds: [embed], content: '@everyone' });
//   },
// };
