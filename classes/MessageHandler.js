module.exports = class MessageHandler {
    constructor(message_handler_data, requirements, callback) {
        this.data = message_handler_data;
        this.callback = callback;
        this.type_of_check = requirements.type;
        this.string = requirements.string;
        this.matchcase = requirements.matchcase;
    }

    async execute(message) {
        let content = message.content;
        console.log("Message handler detected!");
        if(!this.matchcase) {
            content = content.toLowerCase();
            this.string = this.string.toLowerCase();
        }

        let matched = false;

        let type_to_func = {
            "contains" : (string) => {return content.includes(string)},
            "endswith" : (string) => {return content.endsWith(string)},
            "startswith" : (string) => {return content.startsWith(string)},
            "equals" : (string) => {return content == string},
            "regex" : (string) => {return content.match(string)},
            "all_messages" : true
        }
        matched = type_to_func[this.type_of_check](this.string);
        
        if (!matched) return;
        this.data = await this?.callback(message, this.data) ?? this.data;
        return;
    }
}