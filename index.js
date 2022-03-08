require('dotenv').config(); // Load .env file
const axios = require('axios');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const keepAlive = require('./server');

function getPrices() {
	// API for price data.
	axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.COIN_ID}`).then(res => {
		// If we got a valid response
		if(res.data && res.data[0].current_price && res.data[0].price_change_percentage_24h) {
			let currentPrice = res.data[0].current_price || 0 // Default to zero
			let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = res.data[0].symbol || '?' 
			client.user.setPresence({
				game: {
					// Example: "Watching -5,52% | BTC"
					name: `${priceChange.toFixed(2)}% | ${symbol.toUpperCase()}`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			})

			client.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`FNC ${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)}`)

			console.log('Updated price to', currentPrice)
		}
		else
			console.log('Could not load player count data for', process.env.COIN_ID)

	}).catch(err => console.log('Error at api.coingecko.com data:', err))
}

// Runs when client connects to Discord.
client.on('ready', () => {
	console.log('Logged in as', client.user.tag)

	getPrices() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getPrices, Math.max(1, 1 || 1) * 60 * 1000)
})

// Login to Discord
keepAlive();
client.login(process.env.DISCORD_TOKEN)
