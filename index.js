const express = require("express");
const path= require("path");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const server = express();
const bot = new TelegramBot(token, { polling: true });
const port = process.env.PORT || 5000;
const gameName = "dinosaurGame_bot";
const queries= {};

// Get the enviromental variables
dotenv.config({
    path: ".env"
});

const token = process.env["TELEGRAM_TOKEN"];

server.use(express.static(path.join(__dirname, 'public')));


// Help command
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot allows the user to play the chrome's t-rex game from your web browser, to start a game use the command /start or /game"));

// start|game command
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));

bot.on("callback_query", function (query) {
    if(query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "'is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = "https://URL/index.html? id="+query.id;
    }
})