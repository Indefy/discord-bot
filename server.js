const express = require("express");
const cors = require("cors");
const {
	Client,
	GatewayIntentBits,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
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

// Steam API setup (dynamic import)
let SteamAPI;
(async () => {
	const steamapiModule = await import("steamapi");
	SteamAPI = steamapiModule.default;
	const steam = new SteamAPI(process.env.STEAM_API_KEY);

	// Log successful Steam API connection
	steam
		.getAppList()
		.then(() => {
			console.log("Successfully connected to Steam API");
		})
		.catch((error) => {
			console.error("Error connecting to Steam API:", error);
		});

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
				response.data.data[
					Math.floor(Math.random() * response.data.data.length)
				];
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
					`${process.env.API_BASE_URL}/api/recommend/${genre}`
				);
				const animeEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(data.title)
					.setDescription(data.synopsis)
					.setThumbnail(data.images.jpg.image_url)
					.setFooter({ text: "Enjoy your recommendation!" });

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId("another")
						.setLabel("Another Recommendation")
						.setStyle(ButtonStyle.Primary)
				);

				await message.channel.send({ embeds: [animeEmbed], components: [row] });
			} catch (error) {
				message.channel.send(
					"Error fetching recommendation. Make sure the genre is valid."
				);
			}
		} else if (message.content.startsWith("!news")) {
			try {
				const { data } = await axios.get(
					`${process.env.API_BASE_URL}/api/news`
				);
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
		} else if (message.content.startsWith("!compare")) {
			const args = message.content.split(" ");
			if (args.length < 4) {
				message.channel.send(
					"Please provide two Steam profile URLs and a game name. Usage: `!compare <profile1> <profile2> <game>`"
				);
				return;
			}

			const profile1 = args[1];
			const profile2 = args[2];
			const gameName = args.slice(3).join(" ");

			try {
				// Fetch game details from Steam
				const gameDetails = await axios.get(
					`https://api.steampowered.com/ISteamApps/GetAppList/v2/`
				);
				const game = gameDetails.data.applist.apps.find(
					(app) => app.name.toLowerCase() === gameName.toLowerCase()
				);

				if (!game) {
					message.channel.send("Game not found on Steam.");
					return;
				}

				console.log(
					`Fetching achievements for game: ${gameName}, appid: ${game.appid}`
				);

				// Fetch achievement schema for the game
				const schemaResponse = await axios.get(
					`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/`,
					{
						params: {
							key: process.env.STEAM_API_KEY,
							appid: game.appid,
						},
					}
				);
				const achievementSchema =
					schemaResponse.data.game.availableGameStats.achievements;

				const [achievements1, achievements2] = await Promise.all([
					steam
						.getUserAchievements(profile1, game.appid)
						.catch((err) => ({ error: err })),
					steam
						.getUserAchievements(profile2, game.appid)
						.catch((err) => ({ error: err })),
				]);

				const profiles = await axios.get(
					`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${profile1},${profile2}`
				);
				const profileData = profiles.data.response.players;

				const profile1Data = profileData.find((p) => p.steamid === profile1);
				const profile2Data = profileData.find((p) => p.steamid === profile2);

				console.log("Raw achievements data for profile 1:", achievements1);
				console.log("Raw achievements data for profile 2:", achievements2);

				if (achievements1.error || achievements2.error) {
					message.channel.send(
						"One of the profiles or the game does not have publicly available achievements."
					);
					console.log("Error details for profile 1:", achievements1.error);
					console.log("Error details for profile 2:", achievements2.error);
					return;
				}

				// Split the table if it exceeds the limit
				let tableParts = [];
				let table =
					"| Achievement | " +
					profile1Data.personaname +
					" | " +
					profile2Data.personaname +
					" |\n| --- | --- | --- |\n";
				achievementSchema.forEach((achievement) => {
					const user1Achievement = achievements1.achievements.find(
						(a) => a.name === achievement.name
					);
					const user2Achievement = achievements2.achievements.find(
						(a) => a.name === achievement.name
					);
					const row = `| ${achievement.displayName} | ${
						user1Achievement?.unlocked ? "✅" : "❌"
					} | ${user2Achievement?.unlocked ? "✅" : "❌"} |\n`;
					if ((table + row).length > 1024) {
						tableParts.push(table);
						table =
							"| Achievement | " +
							profile1Data.personaname +
							" | " +
							profile2Data.personaname +
							" |\n| --- | --- | --- |\n";
					}
					table += row;
				});
				tableParts.push(table);

				// Determine the winner
				const profile1Count = achievements1.achievements.filter(
					(a) => a.unlocked
				).length;
				const profile2Count = achievements2.achievements.filter(
					(a) => a.unlocked
				).length;
				const winner =
					profile1Count > profile2Count
						? profile1Data.personaname
						: profile2Data.personaname;

				// Create embed
				const embed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`Comparison for ${gameName}`)
					.setDescription(
						`Here is the achievement comparison between ${profile1Data.personaname} and ${profile2Data.personaname} for ${gameName}.`
					)
					.setThumbnail(
						winner === profile1Data.personaname
							? profile1Data.avatarfull
							: profile2Data.avatarfull
					)
					.addFields({
						name: "Winner",
						value: `The winner is ${winner} with ${Math.max(
							profile1Count,
							profile2Count
						)} achievements!`,
					})
					.setFooter({ text: "Powered by Steam API" });

				tableParts.forEach((part, index) => {
					embed.addFields({
						name: index === 0 ? "Achievements" : "\u200b",
						value: part,
					});
				});

				message.channel.send({ embeds: [embed] });
			} catch (error) {
				console.error("Error comparing achievements:", error);
				message.channel.send("Error comparing achievements.");
			}
		}
	});

	client.on("interactionCreate", async (interaction) => {
		if (interaction.isButton()) {
			if (interaction.customId === "another") {
				const genre = "action"; // Replace with logic to get genre if necessary
				const { data } = await axios.get(
					`${process.env.API_BASE_URL}/api/recommend/${genre}`
				);
				const animeEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(data.title)
					.setDescription(data.synopsis)
					.setThumbnail(data.images.jpg.image_url)
					.setFooter({ text: "Enjoy your recommendation!" });

				await interaction.update({ embeds: [animeEmbed], components: [] });
			}
		}

		if (interaction.isStringSelectMenu()) {
			// Changed from isSelectMenu to isStringSelectMenu
			if (interaction.customId === "select") {
				const genre = interaction.values[0];
				const { data } = await axios.get(
					`${process.env.API_BASE_URL}/api/recommend/${genre}`
				);
				const animeEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(data.title)
					.setDescription(data.synopsis)
					.setThumbnail(data.images.jpg.image_url)
					.setFooter({ text: "Enjoy your recommendation!" });

				await interaction.update({
					content: `You selected ${genre}`,
					embeds: [animeEmbed],
					components: [],
				});
			}
		}
	});

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
