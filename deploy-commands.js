const { REST } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

try {
  // Verifica se o diretório de comandos existe
  if (!fs.existsSync(commandsPath)) {
    console.error('O diretório de comandos não foi encontrado.');
    process.exit(1);
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`Ignorando arquivo ${file}, pois não exporta um comando válido.`);
    }
  }

  const clientId = process.env.clientId;
  const guildId = process.env.guildId;
  const token = process.env.token;

  if (!clientId || !guildId || !token) {
    console.error('As variáveis de ambiente (CLIENT_ID, GUILD_ID, BOT_TOKEN) não estão definidas corretamente no arquivo .env.');
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
      console.error('Ocorreu um erro ao atualizar os comandos:', error);
    }
  })();
} catch (error) {
  console.error('Ocorreu um erro ao carregar os comandos:', error);
}
