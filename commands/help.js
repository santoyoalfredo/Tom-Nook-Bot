const Discord = require('discord.js');
require('dotenv').config();

module.exports = {
	name: 'help',
	description: 'You really need a description for a help command?',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	async execute(message, args) {
		const data = [];
		const { commands } = message.client;

		// Embed skeleton
		const helpEmbed = new Discord.MessageEmbed()
			.setTitle('Commands')
		process.env.configIcon
		// Grab all commands for default message
		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nYou can send \`${process.env.prefix}help [command name]\` to get info on a specific command!`);

			helpEmbed.setDescription(data);
			return message.channel.send(helpEmbed);
		}

		// Grab help info about a specific command
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		// Check if command exists
		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		// Grab command info
		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${process.env.prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		helpEmbed.setDescription(data);
		return message.channel.send(helpEmbed);
	},
};
