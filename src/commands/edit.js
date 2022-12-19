const { SlashCommandBuilder } = require('discord.js');
const { supabase } = require('../../supabase');
const { EmbedBuilder } = require('discord.js');
const { weapons, labelToKey } = require('../utils/weapons.js');
const { factions } = require('../utils/factions.js');
const moment = require('moment');

const generateEmbed = ({ player }) => {
  return player.third_weapon === 'none'
    ? new EmbedBuilder()
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
          { name: 'Deuxième arme', value: weapons[player.second_weapon].label, inline: true }
        )
        .setFooter({
          text: `Joueur ajouté le ${moment(player.created_at).locale('fr').format('D MMMM YYYY')}`,
        })
    : new EmbedBuilder()
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
          { name: 'Troisième arme', value: weapons[player.third_weapon].label, inline: true }
        )
        .setFooter({
          text: `Joueur ajouté le ${moment(player.created_at).locale('fr').format('D MMMM YYYY')}`,
        });
};

const successEmbed = ({ player, interaction }) => {
  return new EmbedBuilder()
    .setColor('Green')
    .setTitle(`Modification par ${interaction.user.tag}`)
    .setDescription(`Les informations de ${player.ig_username} ont bien été modifiées`)
    .setTimestamp()
    .setFooter({
      iconURL: interaction.user.avatarURL({ dynamic: true }),
      text: `ID: ${interaction.user.id}`,
    });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edit')
    .setDescription("Modifie les informations d'un joueur")
    .addStringOption((option) =>
      option.setName('username').setDescription('Le pseudo IG du joueur').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('type').setDescription('Le type de modification').setRequired(true).addChoices(
        {
          name: 'Gearscore',
          value: 'gearscore',
        },
        {
          name: 'Première arme',
          value: 'first_weapon',
        },
        {
          name: 'Deuxième arme',
          value: 'second_weapon',
        },
        {
          name: 'Troisième arme',
          value: 'third_weapon',
        }
      )
    )
    .addStringOption((option) =>
      option.setName('value').setDescription('La nouvelle valeur').setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString('username');
    const type = interaction.options.getString('type');

    const { data, error } = await supabase.from('players').select('*').eq('ig_username', username);

    if (error) {
      console.log(error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Modification par ${interaction.user.tag}`)
            .setDescription(
              `Une erreur est survenue lors de la modification des informations de ${player.ig_username}`
            )
            .setTimestamp()
            .setFooter({
              iconURL: interaction.user.avatarURL({ dynamic: true }),
              text: `ID: ${interaction.user.id}`,
            }),
        ],
      });
    }

    if (data.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Modification par ${interaction.user.tag}`)
            .setDescription(`Le joueur ${username} n'existe pas`)
            .setTimestamp()
            .setFooter({
              iconURL: interaction.user.avatarURL({ dynamic: true }),
              text: `ID: ${interaction.user.id}`,
            }),
        ],
      });
    }

    const player = data[0];

    switch (type) {
      case 'gearscore':
        if (interaction.options.getString('value').match(/^[0-9]+$/) === null) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${
                    player.ig_username
                  }. Veillez à bien renseigner un nombre. Valeur renseignée : **${interaction.options.getString(
                    'value'
                  )}**`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        await supabase
          .from('players')
          .update({ gearscore: interaction.options.getString('value') })
          .eq('ig_username', username);

        player.gearscore = interaction.options.getString('value');

        interaction.reply({
          embeds: [successEmbed({ player, interaction }), generateEmbed({ player })],
        });

        break;
      case 'first_weapon':
        player.first_weapon = labelToKey(interaction.options.getString('value'));

        if (player.first_weapon === undefined) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${
                    player.ig_username
                  }. L'arme renseignée n'existe pas. Valeur renseignée : **${interaction.options.getString('value')}**`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        if (player.first_weapon === player.second_weapon) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${player.ig_username}. Vous ne pouvez pas avoir deux fois la même arme.`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        if (player.first_weapon === player.third_weapon) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${player.ig_username}. Vous ne pouvez pas avoir deux fois la même arme.`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        await supabase
          .from('players')
          .update({ first_weapon: player.first_weapon })
          .eq('ig_username', username);

        interaction.reply({
          embeds: [successEmbed({ player, interaction }), generateEmbed({ player })],
        });

        break;
      case 'second_weapon':
        player.second_weapon = labelToKey(interaction.options.getString('value'));

        if (player.second_weapon === undefined) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${
                    player.ig_username
                  }. L'arme renseignée n'existe pas. Valeur renseignée : **${interaction.options.getString(
                    'value'
                  )}**`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        if (player.first_weapon === player.second_weapon) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${player.ig_username}. Vous ne pouvez pas avoir deux fois la même arme.`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        if (player.second_weapon === player.third_weapon) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${player.ig_username}. Vous ne pouvez pas avoir deux fois la même arme.`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        await supabase
          .from('players')
          .update({ second_weapon: player.second_weapon })
          .eq('ig_username', username);

        interaction.reply({
          embeds: [successEmbed({ player, interaction }), generateEmbed({ player })],
        });

        break;
      case 'third_weapon':
        player.third_weapon = labelToKey(interaction.options.getString('value'));

        if (player.third_weapon === undefined) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${
                    player.ig_username
                  }. L'arme renseignée n'existe pas. Valeur renseignée : **${interaction.options.getString(
                    'value'
                  )}**`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        if (player.third_weapon === player.first_weapon) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${player.ig_username}. Vous ne pouvez pas avoir deux fois la même arme.`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        if (player.second_weapon === player.third_weapon) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Modification par ${interaction.user.tag}`)
                .setDescription(
                  `Une erreur est survenue lors de la modification des informations de ${player.ig_username}. Vous ne pouvez pas avoir deux fois la même arme.`
                )
                .setTimestamp()
                .setFooter({
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                  text: `ID: ${interaction.user.id}`,
                }),
            ],
          });
        }

        await supabase
          .from('players')
          .update({ third_weapon: player.third_weapon })
          .eq('ig_username', username);

        interaction.reply({
          embeds: [successEmbed({ player, interaction }), generateEmbed({ player })],
        });

        break;
    }
  },
};
