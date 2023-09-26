const fs = require('node:fs');
const path = require('node:path');
const readline = require('readline');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      return;
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

  const guildName = message.guild.name;
  const userId = message.author.id;
  const userName = message.author.username;
  const messageDate = new Date().toLocaleDateString();
  const messageTime = new Date().toLocaleTimeString();

  const formattedMessage = `[${messageDate} ${messageTime}] ${userName} (${userId}) em ${guildName}`;

  const logFileName = './logs/message-log.txt';
  fs.appendFile(logFileName, formattedMessage + '\n', (err) => {
    if (err) {
      console.error('Erro ao registrar a mensagem:', err);
    } else {
      return;
    }
  });
});

// Evento para tratar erros
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

      if (existingBan) {
        const newBannedDays = existingBan.bannedDays + (bannedDays || 0);
        updateBanInfo(userId, newBannedDays);
        if (newBannedDays === 0) {
          console.log(`Usuário ${userId} foi banido permanentemente.`);
        } else {
          console.log(`Usuário ${userId} teve seu banimento estendido por ${bannedDays} dias.`);
        }
      } else {
        banUser(userId, bannedDays);
        if (bannedDays === 0) {
          console.log(`Usuário ${userId} foi banido permanentemente.`);
        } else {
          console.log(`Usuário ${userId} foi banido por ${bannedDays} dias.`);
        }
      }
    }
  } else if (command === 'unban') {
    const userId = args[0];

    if (!userId) {
      console.log('Uso correto: unban <userId>');
    } else {
      const success = unbanUser(userId);
      if (success) {
        console.log(`Usuário ${userId} foi desbanido.`);
      } else {
        console.log(`Usuário ${userId} não encontrado na lista de banidos.`);
      }
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

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function banUser(userId, bannedDays) {
  const bannedAt = getCurrentDate();
  const banInfo = `${userId}, ${bannedDays}, ${bannedAt}`;

  fs.appendFileSync('./logs/banned-users.txt', `${banInfo}\n`);
}

function updateBanInfo(userId, bannedDays) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => line.trim());

    const updatedBanList = bannedUsers.map(line => {
      const [id, oldBannedDays, bannedAt] = line.split(',').map(item => item.trim());
      if (id === userId) {
        return `${id}, ${bannedDays}, ${bannedAt}`;
      }
      return line;
    });

    fs.writeFileSync(bannedUsersFile, updatedBanList.join('\n'));
  }
}

function unbanUser(userId) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => line.trim());

    const updatedBanList = bannedUsers.filter(line => {
      const [id] = line.split(',').map(item => item.trim());
      return id !== userId;
    });

    if (bannedUsers.length === updatedBanList.length) {
      return false;
    }

    fs.writeFileSync(bannedUsersFile, updatedBanList.join('\n'));
    return true;
  }

  return false;
}

function removeUserFromBanList(userId) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => {
        const [id] = line.split(',').map(item => item.trim());
        return id;
      });

    const updatedBanList = bannedUsers.filter(id => id !== userId);

    fs.writeFileSync(bannedUsersFile, updatedBanList.join('\n'));
  }
}

function clearCommands() {
  fs.unlinkSync('./logs/message-log.txt');
  console.log('Registro de comandos limpo com sucesso.');
}
