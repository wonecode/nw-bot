const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const { supabase } = require('../../supabase');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

const embed = ({ balance, last_transaction, updated_date }) =>
  new EmbedBuilder()
    .setAuthor({
      name: 'Trésorerie O&L',
      iconURL:
        'https://www.iconbunny.com/icons/media/catalog/product/9/4/948.9-local-banks-icon-iconbunny.jpg',
    })
    .setColor('#9b59b6')
    .addFields(
      {
        name: 'Solde',
        value: `\`\`\`💰 ${balance.toLocaleString('FR-fr', {
          minimumFractionDigits: 2,
        })}\`\`\``,
      },
      {
        name: 'Dernière transaction',
        value: `\`\`\`🧾 ${last_transaction.amount} pour ${last_transaction.reason} par ${last_transaction.user}\`\`\``,
      }
    )
    .setFooter({
      text: `Dernière mise à jour du solde le ${moment(updated_date).locale('fr').format('D MMMM YYYY à HH:mm')}`,
    });

const actionButtons = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('updateBalance')
    .setLabel('Mettre à jour le solde')
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId('addTransaction')
    .setLabel('Ajouter une transaction')
    .setStyle(ButtonStyle.Success)
);

module.exports = {
  embed,
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Afficher le solde de la trésorerie de la guilde'),
  async execute(interaction) {
    const { data: balanceData, error: balanceError } = await supabase.from('balance').select('*');
    const { data: lastTransactionData, error: lastTransactionError } = await supabase
      .from('balance_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (balanceError || lastTransactionError) {
      console.log(balanceError, lastTransactionError);
      return interaction.reply({ content: 'Une erreur est survenue', ephemeral: true });
    }

    await interaction.reply({
      embeds: [embed({ balance: balanceData[0].count, last_transaction: lastTransactionData[0], updated_date: balanceData[0].updated_at })],
      components: [actionButtons],
    });
  },
};
