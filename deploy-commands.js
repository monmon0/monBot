const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const clientId = process.env.CLIENT_ID;
const  guildId  = process.env.GUILD_ID;
const token  = process.env.TOKEN;

const commands = [
	new SlashCommandBuilder().setName('god').setDescription('God complex affirmation'),
	new SlashCommandBuilder().setName('rekt').setDescription('Wish someone a nice rekt').addUserOption(option => option.setName('target').setDescription('Select a user')),
	new SlashCommandBuilder().setName('wordle').setDescription('Deciding Wordle Champion otd')
	.addIntegerOption(option => option.setName('int').setDescription('Enter single digit wordle tries').setRequired(true)),
	// .addStringOption(option => option.setName('contestant').setDescription('Enter your server username').setRequired(true)),
	// new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
	new SlashCommandBuilder().setName('wordlegod').setDescription(' Wordle God OTD ')
	.addStringOption(option => option.setName('date').setDescription('Enter todays date').setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

console.log(token)