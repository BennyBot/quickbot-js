module.exports = class Command {
    // construct with data, execute, and command data
    constructor(command_properties, command_data, command_execute, command_update, command_required_perms) {
        this.command_properties = command_properties;
        this.command_data = command_data;
        this.command_execute = command_execute;
        this.command_update = command_update;
        this.command_required_perms = command_required_perms;
    }

    // execute the command
    async execute(interaction) {
        let payload = {
            interaction: interaction,
            data: this.command_data
        };
        if(!this.command_execute) {
            return false;
        }
        //console.log(interaction.member.roles.cache);
        // check if the user has the required permissions
        if(this.command_required_perms) {
            let has_perms = true;
            console.log(this.command_required_perms);

            for(let perm of this.command_required_perms) {
                let result;
                if(perm.type === "discord_permission") {
                    result = interaction.member.permissions.has(perm.value);
                } else if (perm.type === "role") {
                    result = interaction.member.roles.cache.map((role) => role.name).includes(perm.value);
                } 
                
                result = perm.check === "has" ? result : !result;
                if(!result) {
                    has_perms = false;
                    break;
                }
            }
            if(!has_perms) {
                await interaction.reply({content:"You do not have permission to use this command", ephemeral: true});
                return;
            }
        }

        this.command_data = await this.command_execute(payload) ?? payload.data;
        return true;
    }

    // update the data
    async update(time) {
        if(!this.command_update) {
            return false;
        }
        this.command_data = await this.command_update(time, this.command_data) ?? this.command_data;
        return true;
    }

    get name()
    {
        return this.command_properties.name;
    }

    get options()
    {
        return this.command_properties?.options ?? [];
    }
}