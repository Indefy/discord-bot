const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

const app = express();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.login(process.env.BOT_TOKEN);

app.use(cors());
app.use(express.json());

// Define genreMap in the global scope
const genreMap = {
	action: 1,
	adventure: 2,
	cars: 3,
	comedy: 4,
	dementia: 5,
	demons: 6,
	mystery: 7,
	drama: 8,
	ecchi: 9,
	fantasy: 10,
	game: 11,
	hentai: 12,
	historical: 13,
	horror: 14,
	kids: 15,
	magic: 16,
	martial_arts: 17,
	mecha: 18,
	music: 19,
	parody: 20,
	samurai: 21,
	romance: 22,
	school: 23,
	sci_fi: 24,
	shoujo: 25,
	shoujo_ai: 26,
	shounen: 27,
	shounen_ai: 28,
	space: 29,
	sports: 30,
	super_power: 31,
	vampire: 32,
	yaoi: 33,
	yuri: 34,
	harem: 35,
	slice_of_life: 36,
	supernatural: 37,
	military: 38,
	police: 39,
	psychological: 40,
	thriller: 41,
	seinen: 42,
	josei: 43,
};

// API Routes for Frontend
app.get("/api/recommend/:genre", async (req, res) => {
	const genre = req.params.genre.toLowerCase();
	const genreId = genreMap[genre];
	if (!genreId) {
		return res.status(400).send("Invalid genre");
	}

	try {
		const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
			params: {
				genres: genreId,
				limit: 10,
			},
		});
		const randomAnime =
			response.data.data[Math.floor(Math.random() * response.data.data.length)];
		res.json(randomAnime);
	} catch (error) {
		console.error("Error fetching recommendations:", error);
		res.status(500).send("Error fetching recommendations");
	}
});

app.get("/api/news", async (req, res) => {
	try {
		const response = await axios.get(
			"https://api.jikan.moe/v4/seasons/upcoming"
		);
		res.json(response.data.data);
	} catch (error) {
		console.error("Error fetching news:", error);
		res.status(500).send("Error fetching news");
	}
});

// Discord Bot Commands
client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	if (message.content.startsWith("!recommend")) {
		const args = message.content.split(" ");
		if (args.length < 2) {
			message.channel.send(
				"Please provide a genre. Usage: `!recommend <genre>`"
			);
			return;
		}
		const genre = args[1];
		try {
			const { data } = await axios.get(
				`http://localhost:5000/api/recommend/${genre}`
			);
			message.channel.send(
				`**${data.title}**\n${data.synopsis}\n${data.images.jpg.image_url}`
			);
		} catch (error) {
			message.channel.send(
				"Error fetching recommendation. Make sure the genre is valid."
			);
		}
	} else if (message.content.startsWith("!news")) {
		try {
			const { data } = await axios.get("http://localhost:5000/api/news");
			let newsMessage = "Upcoming Anime News:\n";
			data.slice(0, 5).forEach((item) => {
				newsMessage += `**${item.title}**\n${item.synopsis}\n${item.images.jpg.image_url}\n\n`;
			});
			message.channel.send(newsMessage);
		} catch (error) {
			message.channel.send("Error fetching news.");
		}
	} else if (message.content.startsWith("!genres")) {
		const genres = Object.keys(genreMap)
			.map((genre) => `• ${genre}`)
			.join("\n");
		const embed = new EmbedBuilder()
			.setColor("#0099ff")
			.setTitle("Available Genres")
			.setDescription(genres)
			.setFooter({ text: "Use !recommend <genre> to get a recommendation" });

		message.channel.send({ embeds: [embed] });
	} else if (message.content.startsWith("!help")) {
		const embed = new EmbedBuilder()
			.setColor("#0099ff")
			.setTitle("Bot Commands")
			.setDescription("Here are the commands you can use:")
			.addFields(
				{
					name: "!recommend <genre>",
					value: "Get an anime recommendation for the specified genre.",
				},
				{ name: "!news", value: "Get the latest upcoming anime news." },
				{ name: "!genres", value: "List all available genres." },
				{ name: "!help", value: "Display this help message." }
			)
			.setFooter({
				text: "Bot Created by Adi.B, Enjoy using Anime Advice Bot!",
			});

		message.channel.send({ embeds: [embed] });
	}
});

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require("express");
// const cors = require("cors");
// const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
// const axios = require("axios");
// require("dotenv").config();

// const app = express();
// const client = new Client({
// 	intents: [
// 		GatewayIntentBits.Guilds,
// 		GatewayIntentBits.GuildMessages,
// 		GatewayIntentBits.MessageContent,
// 	],
// });

// client.login(process.env.BOT_TOKEN);

// app.use(cors());
// app.use(express.json());

// // Define genreMap in the global scope
// const genreMap = {
// 	action: 1,
// 	adventure: 2,
// 	cars: 3,
// 	comedy: 4,
// 	dementia: 5,
// 	demons: 6,
// 	mystery: 7,
// 	drama: 8,
// 	ecchi: 9,
// 	fantasy: 10,
// 	game: 11,
// 	hentai: 12,
// 	historical: 13,
// 	horror: 14,
// 	kids: 15,
// 	magic: 16,
// 	martial_arts: 17,
// 	mecha: 18,
// 	music: 19,
// 	parody: 20,
// 	samurai: 21,
// 	romance: 22,
// 	school: 23,
// 	sci_fi: 24,
// 	shoujo: 25,
// 	shoujo_ai: 26,
// 	shounen: 27,
// 	shounen_ai: 28,
// 	space: 29,
// 	sports: 30,
// 	super_power: 31,
// 	vampire: 32,
// 	yaoi: 33,
// 	yuri: 34,
// 	harem: 35,
// 	slice_of_life: 36,
// 	supernatural: 37,
// 	military: 38,
// 	police: 39,
// 	psychological: 40,
// 	thriller: 41,
// 	seinen: 42,
// 	josei: 43,
// };

// // API Routes for Frontend
// app.get("/api/recommend/:genre", async (req, res) => {
// 	const genre = req.params.genre.toLowerCase();
// 	const genreId = genreMap[genre];
// 	if (!genreId) {
// 		return res.status(400).send("Invalid genre");
// 	}

// 	try {
// 		const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
// 			params: {
// 				genres: genreId,
// 				limit: 10,
// 			},
// 		});
// 		const randomAnime =
// 			response.data.data[Math.floor(Math.random() * response.data.data.length)];
// 		res.json(randomAnime);
// 	} catch (error) {
// 		console.error("Error fetching recommendations:", error);
// 		res.status(500).send("Error fetching recommendations");
// 	}
// });

// app.get("/api/news", async (req, res) => {
// 	try {
// 		const response = await axios.get(
// 			"https://api.jikan.moe/v4/seasons/upcoming"
// 		);
// 		res.json(response.data.data);
// 	} catch (error) {
// 		console.error("Error fetching news:", error);
// 		res.status(500).send("Error fetching news");
// 	}
// });

// // Discord Bot Commands
// client.on("messageCreate", async (message) => {
// 	if (message.author.bot) return;

// 	if (message.content.startsWith("!recommend")) {
// 		const args = message.content.split(" ");
// 		if (args.length < 2) {
// 			message.channel.send(
// 				"Please provide a genre. Usage: `!recommend <genre>`"
// 			);
// 			return;
// 		}
// 		const genre = args[1];
// 		try {
// 			const { data } = await axios.get(
// 				`http://localhost:5000/api/recommend/${genre}`
// 			);
// 			message.channel.send(
// 				`**${data.title}**\n${data.synopsis}\n${data.images.jpg.image_url}`
// 			);
// 		} catch (error) {
// 			message.channel.send(
// 				"Error fetching recommendation. Make sure the genre is valid."
// 			);
// 		}
// 	} else if (message.content.startsWith("!news")) {
// 		try {
// 			const { data } = await axios.get("http://localhost:5000/api/news");
// 			let newsMessage = "Upcoming Anime News:\n";
// 			data.slice(0, 5).forEach((item) => {
// 				newsMessage += `**${item.title}**\n${item.synopsis}\n${item.images.jpg.image_url}\n\n`;
// 			});
// 			message.channel.send(newsMessage);
// 		} catch (error) {
// 			message.channel.send("Error fetching news.");
// 		}
// 	} else if (message.content.startsWith("!genres")) {
// 		const genres = Object.keys(genreMap)
// 			.map((genre) => `• ${genre}`)
// 			.join("\n");
// 		const embed = new EmbedBuilder()
// 			.setColor("#0099ff")
// 			.setTitle("Available Genres")
// 			.setDescription(genres)
// 			.setFooter({ text: "Use !recommend <genre> to get a recommendation" });

// 		message.channel.send({ embeds: [embed] });
// 	}
// });

// client.on("ready", () => {
// 	console.log(`Logged in as ${client.user.tag}!`);
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
