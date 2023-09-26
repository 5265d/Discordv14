const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const {
  getCurrentDate,
  banUser,
  updateBanInfo,
  unbanUser,
  removeUserFromBanList,
  clearCommands,
} = require('./Eventos/function');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();


const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  });

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, user } = interaction;
  const command = client.commands.get(commandName);

  if (!command) return;

  const banInfo = isUserBanned(user.id);
  if (banInfo) {
    const { bannedDays } = banInfo;
    const banEndDate = new Date(banInfo.bannedAt);
    banEndDate.setDate(banEndDate.getDate() + bannedDays);
    const currentDate = new Date();

    if (currentDate < banEndDate) {
      const daysRemaining = Math.ceil((banEndDate - currentDate) / (1000 * 60 * 60 * 24));
      await interaction.reply({ content: `**Você foi banido por ${daysRemaining} dias. Seu banimento terminará em ${banEndDate.toLocaleDateString()}.**`, ephemeral: true });
      return;
    } else {
      removeUserFromBanList(user.id);
    }
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply('Ocorreu um erro ao executar este comando.');
  }
});


const token = process.env.token;
if (!token) {
  console.error('Token não definido no arquivo .env.');
  process.exit(1);
}

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const { guild, author } = message;
  const formattedMessage = `[${new Date().toLocaleString()}] ${author.tag} (${author.id}) em ${guild.name}`;
  const logFileName = './logs/message-log.txt';

  fs.appendFile(logFileName, formattedMessage + '\n', (err) => {
    if (err) console.error('Erro ao registrar a mensagem:', err);
  });
});

client.on('error', (error) => {
  console.error('O bot encontrou um erro:', error);
});

client.login(token);

function isUserBanned(userId) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => {
        const [id, bannedDays, bannedAt] = line.split(',').map(item => item.trim());
        return { id, bannedDays: Number(bannedDays), bannedAt: new Date(bannedAt) };
      });

    return bannedUsers.find(user => user.id === userId);
  }
  return null;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Digite um comando / ',
});

rl.prompt();

rl.on('line', (input) => {
  const args = input.trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'ban') {
    const userId = args[0];
    const bannedDays = args[1] || 0; 

    if (!userId) {
      console.log('Uso correto: ban <userId> [bannedDays]');
    } else {
      const existingBan = isUserBanned(userId);
      const newBannedDays = existingBan ? existingBan.bannedDays + (bannedDays || 0) : bannedDays || 0;

      if (newBannedDays === 0) console.log(`Usuário ${userId} foi banido permanentemente.`);
      else console.log(`Usuário ${userId} teve seu banimento ${existingBan ? 'estendido' : 'criado'} por ${newBannedDays} dias.`);
      if (!existingBan) banUser(userId, newBannedDays);
      else updateBanInfo(userId, newBannedDays);
    }
  } else if (command === 'unban') {
    const userId = args[0];

    if (!userId) {
      console.log('Uso correto: unban <userId>');
    } else {
      const success = unbanUser(userId);
      if (success) console.log(`Usuário ${userId} foi desbanido.`);
      else console.log(`Usuário ${userId} não encontrado na lista de banidos.`);
    }
  } else if (command === 'limparlogs') {
    clearCommands();
    console.log('Registro de comandos foi limpo.');
  } else if (command === 'exit') {
    rl.close();
  } else if (command === 'ajuda') {
    console.log('ban <userId> [bannedDays] - Banir um usuário');
    console.log('unban <userId> - Desbanir um usuário');
    console.log('limparlogs - Limpar o registro de comandos');
    console.log('exit - Encerrar o programa');
  } else {
    console.log('Comando desconhecido. Use "ajuda" para ver a lista de comandos disponíveis.');
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('Encerrando.');
  process.exit(0);
});