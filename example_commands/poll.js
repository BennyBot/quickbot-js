const MessageEmbed = require('discord.js').MessageEmbed;
let emojiDic = require("emoji-dictionary");


const conclude = async (data, poll) => {
    data.concluded_polls.push(poll); // Add the poll to our concluded polls
    for(let i=0; i<data.active_polls.length; i++) {
        console.log(poll == data.active_polls[i]);
        if(data.active_polls[i] == poll) {
            data.active_polls.splice(i, 1); // Remove the poll from active_polls
        }
    }

    let option_1_count = -1;
    let option_2_count = -1;
    let emoji_1_name = emojiDic.getName(poll.option_1.reaction.emoji.toString()); // Get option1's emoji
    let emoji_2_name = emojiDic.getName(poll.option_2.reaction.emoji.toString()); // Get option2's emoji
    poll.poll_message = await poll.poll_message.fetch() // Update the poll message to current status
    for(const r of poll.poll_message.reactions.cache) {
        let emoji_name = emojiDic.getName(r[1].emoji.toString())
        if(emoji_name === emoji_1_name) {
            option_1_count = r[1].count; // Set option_1_count to whatever emoji1's count is
        }
        if(emoji_name === emoji_2_name) {
            option_2_count = r[1].count // Set option_2_count to whatever emoji2's count is
        }
    }
    console.log(option_1_count);
    console.log(option_2_count);
    /*
        Make a reply to the poll stating the winner or if it tied
    */
    if(option_1_count > option_2_count) {
        await poll.poll_message.reply(`${poll.option_1.name} Wins!`);
    }
    else if(option_2_count > option_1_count) {
        await poll.poll_message.reply(`${poll.option_2.name} Wins!`);
    }
    else {
        await poll.poll_message.reply(`${poll.option_1.name} and ${poll.option_2.name} Tied!`);
    }
    return data; // Return the modified data
}
module.exports = {
    execute : async (payload) => {
        let interaction = payload.interaction;
        let payload_data = payload.data;

        let response_embed = new MessageEmbed() // Create a new embed with the purple color and the title of the poll
            .setColor('aa33cc')
            .setTitle(interaction?.options.getString("title"));

        let desc = interaction?.options.getString("description") ?? null;
        if(desc) {
            response_embed.setDescription( // Add the poll's description if it was provided
                desc 
            )
        }

        response_embed.addField(
            "Intended Group",
            `${interaction?.options.getMentionable("group")}`,  // Add a field containing what the intended group was
            false
        );

        response_embed.addField(
            interaction?.options.getString("option1"), 
            `React with ${interaction?.options.getString("emoji1")}`, // Add a field with option1 and its emoji
            true
        );

        response_embed.addField(
            interaction?.options.getString("option2"),
            `React with ${interaction?.options.getString("emoji2")}`, // Add a field with option2 and its emoji
            true
        );

        if(!(interaction?.options.getString("anonymous")==="true")) {
            response_embed.setFooter(
                `Poll created by ${interaction.member.nickname ?? interaction.member.user.username}` // Add the author to the footer if it isn't anonymous
            );
        }

        let created_poll = await interaction.channel.send({embeds: [response_embed]});
        let created_reaction_1 = null;
        let created_reaction_2 = null;

        try {
            // React with option1 and option2
            created_reaction_1 = await created_poll.react(interaction?.options.getString('emoji1'));
            created_reaction_2 = await created_poll.react(interaction?.options.getString('emoji2'));
        } catch {
            console.log("an invalid reaction was attempted");
            // delete the created poll 
            await created_poll.delete();
            // tell the user their reaction was invalid
            await interaction.reply({content: "A reaction you provided was invalid. Please try again.", ephemeral: true});
            return false;
        }

        let ping = await interaction.channel.send(`Pinging: ${interaction?.options.getMentionable("group")}`);
        await ping.delete(); // Ping the intended group and then delete the ping (Essentially ghost ping them)
        
        let expire_time = (new Date().valueOf()) + (+interaction?.options.getString("duration")); // Set our expiration time in ms
        
        await payload_data.active_polls.push( // Push this poll's data to the active_polls list
            {
                name: interaction?.options.getString("title"),
                origin: interaction,
                option_1: {
                    reaction: created_reaction_1,
                    name: interaction?.options.getString('option1')
                },
                option_2: {
                    reaction: created_reaction_2,
                    name: interaction?.options.getString('option2')
                },
                poll_message: created_poll,
                expiration: expire_time
            }
        )

        
        await interaction.reply({content:`Poll Created`,ephemeral: true}); // Reply to the author that the poll was created
        console.log(payload_data); // Log the current poll data for debugging
        return payload_data; // Return the modified data
    },

    update : async(time, data) => {
        let polls = data.active_polls;
        if(polls.length === 0) {
            return data; // Don't do anything if there are no active polls
        }
        console.log(time);
        console.log(`There are : ${polls.length} active polls`);
        console.log(`There are : ${data.concluded_polls.length} concluded polls`);
        for(const p of polls) {
            if(time >= p.expiration) {
                data = await conclude(data, p); // Conclude the poll if it has expired
            }
        }

        return data; // Return the modified data
    },

    command : {
        name: "poll",
        description: "Create a poll",
        options: [
            {
                name: "title",
                description: "Title of the poll",
                type: 3,
                required: "true"
            },
            {
                name: "group",
                description: "Which role is the poll intended for",
                type: 9,
                required: "true"
            },
            {
                name: "option1",
                description: "Option 1 for participants to pick",
                type: 3,
                required: "true"
            },
            {
                name: "emoji1",
                description: "Emoji for option 1",
                type: 3,
                required: "true"
            },
            {
                name: "option2",
                description: "Option 2 for participants to pick",
                type: 3,
                required: "true"
            },
            {
                name: "emoji2",
                description: "Emoji for option 2",
                type: 3,
                required: "true"
            },
            {
                name: "duration",
                description: "How long should the poll be open",
                type: 3,
                required: "true",
                choices: [
                    {
                        name: "5 seconds",
                        value: "5000"
                    },
                    {
                        name: "1 min",
                        value: "60000"
                    },
                    {
                        name: "15 min",
                        value: "900000"
                    },
                    {
                        name: "30 min",
                        value: "1200000"
                    },
                    {
                        name: "1 hour",
                        value: "3600000"
                    },
                    {
                        name: "6 hours",
                        value: "21600000"
                    }
                ]
            },
            {
                name: "description",
                description: "Description for the poll",
                type: 3,
                required: "false"
            },
            {
                name: "anonymous",
                description: "Make the poll anonymous",
                type: 3,
                required: "false",
                choices: [
                    {
                        name: "yes",
                        value: "true"
                    },
                    {
                        name: "no",
                        value: "false"
                    }
                ]
            }
        ]
    },

    data : {
        active_polls: [],
        concluded_polls: []
    },

    required_perms : null // We don't need any permissions for this command

}