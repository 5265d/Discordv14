const { REST } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {

  }
}

const clientId = process.env.clientId;
const guildId = process.env.guildId;
const token = process.env.token;

if (!clientId || !guildId || !token) {
  console.error('As variáveis de ambiente (clientId, guildId, token) não estão definidas corretamente no arquivo .env.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Iniciando a atualização de ${commands.length} comandos de aplicativo (/).`);

    const data = await rest.put(
      `/applications/${clientId}/guilds/${guildId}/commands`,
      { body: commands }
    );

    console.log(`Atualização concluída com sucesso para ${data.length} comandos de aplicativo (/).`);
  } catch (error) {
    console.error(error);
  }
})();
