const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Obtenha os valores das variáveis de ambiente do arquivo .env
const clientId = process.env.clientId;
const guildId = process.env.guildId;
const token = process.env.token;

const rest = new REST().setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);