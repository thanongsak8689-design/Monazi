
require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('กรุณาตั้งค่า DISCORD_TOKEN และ CLIENT_ID');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
  new SlashCommandBuilder()
    .setName('check')
    .setDescription('ตรวจสอบสถานะบอท Momazi Hup')
    .toJSON(),
];

async function registerCommands() {
  const rest = new REST({ version: '10' })
    .setToken(DISCORD_TOKEN);

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );

  console.log('ลงทะเบียน /check สำเร็จ');
}

client.once('ready', async () => {
  console.log(`Momazi Hup ออนไลน์: ${client.user.tag}`);

  try {
    await registerCommands();
  } catch (error) {
    console.error('ลงทะเบียนคำสั่งไม่สำเร็จ:', error.message);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'check') return;

  const embed = new EmbedBuilder()
    .setColor(0x6633CC)
    .setTitle('Momazi Hup | Bot Status')
    .setDescription('บอทกำลังทำงานตามปกติ')
    .addFields(
      {
        name: 'สถานะ',
        value: '🟢 Online',
        inline: true,
      },
      {
        name: 'Ping',
        value: `${client.ws.ping} ms`,
        inline: true,
      },
      {
        name: 'เซิร์ฟเวอร์',
        value: `${client.guilds.cache.size}`,
        inline: true,
      }
    )
    .setTimestamp();

  try {
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error('ตอบกลับไม่สำเร็จ:', error.message);
  }
});

client.login(DISCORD_TOKEN).catch((error) => {
  console.error('ล็อกอินบอทไม่สำเร็จ:', error.message);
  process.exitCode = 1;
});
