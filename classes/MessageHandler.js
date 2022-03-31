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

        if(this.type_of_check === "contains") {
            if(content.includes(this.string)) {
                this.data = await this.callback(message, this.data);
            }
        }
        else if(this.type_of_check === "endswith") {
            if(content.endsWith(this.string)) {
                this.data = await this.callback(message, this.data);
            }
        }
        else if(this.type_of_check === "startswith") {
            if(content.startsWith(this.string)) {
                this.data = await this.callback(message, this.data);
            }
        }
        else if(this.type_of_check === "equals") {
            if(content === this.string) {
                this.data = await this.callback(message, this.data);
            }
        }
        else if(this.type_of_check === "regex") {
            if(content.match(this.string)) {
                this.data = await this.callback(message, this.data);
            }
        }

        return;
    }
}