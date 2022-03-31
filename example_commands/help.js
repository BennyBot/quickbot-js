const MessageEmbed = require("discord.js").MessageEmbed;

module.exports = {
    execute: async (payload) => {
        let interaction = payload.interaction;
        let payload_data = payload.data;

        let command_list_reference = payload_data?.command_list_reference;

        var response_embed = new MessageEmbed() // Create a new blue embed with the title "Command Help"
            .setColor('#1188aa')
            .setTitle("Command Help");
        
        for(const c of command_list_reference) { // Iterate through all commands
            let command_name = c.name;
            let command_options = [];
            for(const o of c.command_properties.options ?? []) { // Iterate through the command's options
                let option_name = o.name;
                let option_required = o.required==="true";
                let choices = [];
                if(o?.choices) {
                    for(const choice of o.choices) { // iterate through the command's options
                        choices.push(choice.name);
                    }
                } else {
                    choices.push(o.description); // add the option description to choices if there are no option.choices
                }
                // Add the option name and the choices.join to the command_options list
                if(option_required) {
                    command_options.push(`<${option_name}:**${choices.join("**|**")}**>`); // Bold required options
                } else {
                    command_options.push(`<${option_name}:*${choices.join("*|*")}*>`); // Italicize optional options
                }
            }
        
            let full_command_name = `Command: ${command_name}`;
            // Set usage to the command name and all the choices
            let full_command = `Usage: /${c.name} ${command_options.join(" ")}`;

            response_embed.addField( // Add a field to the embed containing the command name and its usage
                command_name,
                full_command,
                false
            );

        }

        
        await interaction.reply({embeds:[response_embed], ephemeral : true}); // Reply secretly to the user with the embed
    },

    update : async(time, data) => {
        return data; // Return the unmodified data because we don't need to update
    },

    command: {
        name: "help",
        description: "Get the help thing",  
    },

    data: {
        requires_command_list: true // Tell the main bot that we need access to the list of commands
    },

    required_perms: null // We don't need any permissions for this command
}