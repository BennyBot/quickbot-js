// This message handler doesn't need any data, so we can just use null

module.exports = {
    data : null,

    // Object with the requirements for the message handler
    requirements : {
        type: "contains",
        string: "hello",
        matchcase: false
    },

    // setup callback for message handler
    callback : async (message, data) => {
        // reply hello saying the author
        message.reply(`Hello ${message.author}!`);

        return data;
    }
}