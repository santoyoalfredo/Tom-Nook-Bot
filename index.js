const fs = require('fs');
const Discord = require('discord.js');
const db = require('./commands/modules/dbInterface');
const schedule = require('./commands/modules/schedule');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
	db.testDB();
	db.setUpDB();

	db.getChannel().then(id => {
		const channel = client.channels.cache.get(id);

		db.checkModule('epic').then(isActive => schedule.epic(isActive, channel));
		db.checkModule('psplus').then(isActive => schedule.psplus(isActive, channel));
		schedule.trackedTitles(channel);
	});
});

// console.log(client.commands);

client.on('message', message => {

	// Check for prefix
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// Grab command from message
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Check if command exists
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	// Prevent direct messages
	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply("You're not allowed to slide into my DMs");
	}

	// Check if arguments were sent when needed
	if (command.args && !args.length) {
		return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	// Execute command
	try {
		db.getChannel().then(id => {
			const channel = client.channels.cache.get(id);
			command.execute(message, args, channel);
		});
	}
	catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}

});

client.login(token);
