const Command = require('./Command.js');
const MessageHandler = require('./MessageHandler.js');
const fs = require('fs');
const Discord = require("discord.js");
const path = require('path');
const url = require('url');


// Add commands to the list of commands for the bot
module.exports = class Bot {
    constructor(TOKEN_ID, GUILD_ID) {
        this.TOKEN_ID = TOKEN_ID;
        this.GUILD_ID = GUILD_ID;
        
        this.client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
        this.message_handlers = [];
        this.command_handlers = [];

        this.initialized = false;
        
        this.example_commands = ["clear", "help", "ping", "test", "poll"];
        this.example_message_handlers = ["hello"]
    }

    // load a specific file from the example commands
    load_example_command = async (file_name=null) => {
        //ensure the example command is in our list
        if(!this.example_commands.includes(file_name) && file_name != null) {
            console.log(`Example command ${file_name} not found.`);
            return;
        }

        await this.load_command_file(`../example_commands/${file_name}.js`);
    }

    // load a specific file from the example message handlers
    load_example_message_handler = async (file_name) => {

        //ensure the example message handler is in our list
        if(!this.example_message_handlers.includes(file_name)) {
            console.log(`Example message handler ${file_name} not found.`);
            return;
        }

        await this.load_message_handler_file(`../example_message_handlers/${file_name}.js`);
    }

    // Load commands from a user input directory
    load_commands_directory = async (dir) => {
        console.log(`import commands from ${dir}`);
        const command_files = await fs.promises.readdir(url.fileURLToPath(dir));
        // iterate through all files in the directory;
        for(const f of command_files) {
            //load the file using our load_command_file
            await this.load_command_file(`${dir}/${f}`);
        }
    }

    // Load message handlers from a user input directory
    load_message_handlers_directory = async (dir) => {
        console.log(`import message handlers from ${dir}`);
        const message_handlers_files = await fs.promises.readdir(url.fileURLToPath(dir))
        // iterate through all files in the directory;
        for(const f of message_handlers_files) {
            // load the file using our load file function
            await this.load_message_handler_file(`${dir}/${f}`);
        }
    }

    // Load a single command from a user input file
    load_command_file = async (file) => {
        const this_cmd = await import(`${file}`);
        // generate a new Command and push it to command handlers

        //console.log(`Current Client: ${this_cmd.client}.`);
        if(this_cmd?.client ?? false) {
            this_cmd.set_client(this.client);
        }

        let command = new Command(
            this_cmd.default?.command ?? (this_cmd?.command ?? null),
            this_cmd.default?.data ?? (this_cmd?.data ?? null),
            this_cmd.default?.execute ?? (this_cmd?.execute ?? null),
            this_cmd.default?.update ?? (this_cmd?.update ?? null),
            this_cmd.default?.required_perms ?? (this_cmd?.required_perms ?? null)
        );
        
        //push the command to the handler
        this.command_handlers.push(command);
    }

    // Load a single message handler from a user input file
    load_message_handler_file = async (file) => {
        const this_message_handler = await import(`${file}`);

        if(this_message_handler?.client ?? false) {
            this_message_handler.set_client(this.client);
        }

        let handler = new MessageHandler(
            this_message_handler.default?.data ?? (this_message_handler?.data ?? null),
            this_message_handler.default?.requirements ?? (this_message_handler?.requirements ?? null),
            this_message_handler.default?.callback ?? (this_message_handler?.callback ?? null)
        );
        //push the command to the handler
        this.message_handlers.push(handler);
    }

    // Load a single command from a user input Command object
    load_command = (command) => {
        //push the command to the handler
        this.command_handlers.push(command);
    }

    // Load a single message handler from a user input MessageHandler object
    load_message_handler = (handler) => {
        //push the command to the handler
        this.message_handlers.push(handler);
    }

    // function to create a new command object and add it to the command list
    create_command = (command, data, execute, update, required_perms=null) => {
        let newcmd = new Command(
            command ?? null,
            data ?? null,
            execute ?? null,
            update ?? null,
            required_perms ?? null
        );
        this.command_handlers.push(newcmd);
    }

    // function to create a new message handler object and add it to the message handler list
    create_message_handler = (data, requirements, callback) => {
        let handler = new MessageHandler(
            data ?? null,
            requirements ?? null,
            callback ?? null
        );
        this.message_handlers.push(handler);
    }

    #ready = async() => {
        this.client.on("ready", async () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            console.log("Setting up commands");
        
            let commands = this.client.guilds.cache.get(this.GUILD_ID).commands; // Get all of the commands from guild
            // Iterate through all of the commands in the command handlers
            await (async () => {
                for(const c of this.command_handlers) {
                    commands?.create(c.command_properties); // Create the command
                    console.log(`Created command ${c.command_properties.name}`);
                    if(c.command_data?.requires_command_list) {
                        c.command_data.command_list_reference = this.command_handlers;
                    }
                }
            })();
        
            console.log(`Complete!`);
        });
        return;
    }

    #message = async(message) => {

        this.client.on("messageCreate", async (message) => {
            console.log("message received");
            console.log(this.message_handlers);
            if(message.author.bot) return; // Ignore bots
    
            // loop through our message handlers and call them
            for(const handler of this.message_handlers) {
                handler.execute(message);
            }
        });
        return;
    }

    #interaction = async() => {
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return; // Do nothing if it wasn't a command

            let command = interaction.command;
            if (!command) return; // Verify that the command exists.
            // Iterate through command handlers
            for(const c of this.command_handlers) {
                if(c.command_properties.name == command.name) {
                    // Execute the command
                    let response = await c.execute(interaction);
                    console.log(
                        `Executed command ${command.name} with response ${response}`
                    );
                }
            }
        });
        return;
    }

    // function to call all command update functions
    #call_updates = async () => {
        for(const c of this.command_handlers) {
            await c.update((new Date().valueOf()));
        }
    }

    // initialize function to setup all bot events and functionality
    initialize = async (update_interval) => {

        this.update_interval = update_interval;
        // setup our ready
        this.#ready();
        // setup our message handler
        this.#message();
        // setup our interaction handler
        this.#interaction();

        // setup call updates on an interval
        var intervalID = setInterval(this.#call_updates, this.update_interval);

        // set our initialization to true
        this.initialized = true;

        return true;
    }

    // function to start the bot
    start = async (update_interval=this.update_interval) => {
        if(!this.initialized) {
            console.log("Bot not yet initialized. Initalizing now.");
            await this.initialize(update_interval);
        }

        this.client.login(this.TOKEN_ID);
        console.log("Bot started.");
        return true;


    }

}

//client.login(process.env.DISCORD_TOKEN); // Bot signs in