const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const server = express();
const port = process.env.PORT || 5000;
const gameName = "dinoGame";
const queries = {};

// Get the enviromental variables
dotenv.config({
  path: ".env",
});

const token = process.env["TELEGRAM_TOKEN"];

// Bot initialization
const bot = new TelegramBot(token, { polling: true });

server.use(express.static(path.join(__dirname, "public")));

// Welcome message
bot.onText(/start/, (msg) =>
  bot.sendMessage(
    msg.from.id,
    "Welcome to DinoGame bot! from this bot you can play the classic T-Rex game from Chromium directly from the in-app browser, if you want more info use the command /help"
  )
);

// Help command
bot.onText(/help/, (msg) =>
  bot.sendMessage(
    msg.from.id,
    "This bot allows the user to play Chromium's T-Rex game from your web browser, to start a game use the command /game"
  )
);

// About command
bot.onText(/about/, (msg) =>
  bot.sendMessage(
    msg.from.id,
    "If you want to check out the code for curiosity or to reuse it you can go to https://github.com/davide-albertelli-isii/DinoGame_bot"
  )
);

// start|game command
bot.onText(/game/, (msg) => bot.sendGame(msg.from.id, gameName));

// callback of /start command
bot.on("callback_query", function (query) {
  if (query.game_short_name !== gameName) {
    bot.answerCallbackQuery(
      query.id,
      "Sorry, '" + query.game_short_name + "'is not available."
    );
  } else {
    queries[query.id] = query;
    let gameurl = "https://dinogamebot.herokuapp.com/index.html?id=" + query.id;
    bot.answerCallbackQuery({
      callback_query_id: query.id,
      url: gameurl,
    });
  }
});

bot.on("inline_query", function (iq) {
  bot.answerInlineQuery(iq.id, [
    { type: "game", id: "0", game_short_name: gameName },
  ]);
});

// Get highscore
server.get("/highscore/:score", function (req, res, next) {
  if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
  let query = queries[req.query.id];
  let options;
  if (query.message) {
    options = {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    };
  } else {
    options = {
      inline_message_id: query.inline_message_id,
    };
  }
  bot.setGameScore(
    query.from.id,
    parseInt(req.params.score),
    options,
    function (err, result) {}
  );
});

// server listening to port
server.listen(port);
