# quickbot-js
Quickly and Easily Create Discord Bots using NodeJS with this API

## What is quickbot

Quickbot is an API that aims to help new users create discord bots fast!

The API currently support:
 - User created slash commands
 - Message event handling

This API comes with the following prewritten examples, showcasing the functionallity of the API

- Commands:
    - /ping : Replies to the sender
    - /clear : Clears 'n' messages from the same channel (Requires channel management permissions)
    - /help : Display commands and their arguments(required and optionional). Will automatically update as more commands are added to the bot.
    - /poll : Creates a poll for an input duration that users can vote on using reactions. Will automatically reply with the winner of the poll once it expires
- Message Handlers:
    - hello : responds to any message containing "hello" with "Hello @<message_sender>"

## Installation Guide

Installing quickbot is easy. Simply create a new node project and run
```sh
npm install --save quickbot
```

## Example Code
```js
// Require this API
const quickbot = require("quickbot");

// Create our bot with its ID and our guild's ID
const bot = new quickbot.Bot(MY_BOT_ID, MY_GUILD_ID);

// Loading an example command:
bot.load_example_command("ping");

// Initialize the bot.
// The input is how often the bot should call updates for commands that have an update specified
bot.initialize(1000);

// Start the bot
bot.start();
```

And that's all there is to it! Now you have a functioning bot that replies "pong" to anyone who runs the /ping command
