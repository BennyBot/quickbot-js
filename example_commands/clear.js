const Permissions = require("discord.js").Permissions

module.exports = {
    execute : async (payload) => {
        let interaction = payload.interaction;
        let payload_data = payload.data;
 
        // Delete n messages from the interaction channel
        await interaction.channel.bulkDelete(+interaction.options.getInteger("amount"), false);
        await interaction.reply({content: "Deleted messages", ephemeral: true});
    },

    update : async(time, data) => {
        return data; // return unmodified data because we don't need to modify it
    },


    command : {
        name: "clear",
        description: "Clear a certain number of messages",
        options: [
            {
                name: "amount",
                description: "Number of messages to clear",
                type: 4,
                required: "true"
            }
        ]  
    },

    data: null, // we don't need data for ping

    required_perms : [
        Permissions.FLAGS.MANAGE_CHANNELS
    ] // We need the MANAGE_CHANNELS permission to use this command

}