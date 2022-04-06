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

        if(!this.matchcase) {
            content = content.toLowerCase();
            this.string = this.string.toLowerCase();
        }

        let matched = false;

        let type_to_func = {
            "contains" : content.includes,
            "endswith" : content.endsWith,
            "startswith" : content.startsWith,
            "regex" : content.match,
            "equals" : (string) => {return content == string},
            "all_messages" : true
        }

        matched = type_to_func[this.type_of_check](this.string);

        if (!matched) return;

        this.data = await this?.callback(message, this.data) ?? this.data;
        return;
    }
}