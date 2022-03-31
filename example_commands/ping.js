module.exports = {

    execute : async (payload) => {
        let interaction = payload.interaction;
        let payload_data = payload.data;
        await interaction.reply({content: "pong", ephemeral : true}); // Reply to the message with pong
    },

    update : async(time, data) => {
        return data; // return unmodified data because we don't need to modify it
    },

    command : {
        name: "ping",
        description: "pongs you",  
    },

    data : null, // we don't need data for ping

    required_perms : null // We don't need any permissions for this command
}