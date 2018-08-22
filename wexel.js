const Discord = require("discord.js");
const colors = require("colors/safe");
const fs = require('fs');
const client = new Discord.Client();
const config = require("./config.json");
const version = require("./version.json");
const talkedRecently = new Set();
const talkreseter = new Set();
const muted = new Set();
const mutedreseter = new Set();
var errorlog = " ";
var outputlog = " ";
var hours = 0;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
dayTimer = setInterval(runEveryDay, 86400000);

client.login(config.token);

function removefromtalkedrecently(name) {
    talkedRecently.delete(name);
    return;
}
function unmuteUser(entry, name) {
    muted.delete(entry);
    console.log(colors.cyan(`${name} is no longer muted.`));
    return;
}
function writeJSON(a, b, path) {
    a = JSON.stringify(a);
    fs.writeFileSync(`${path}/${b}.json`, a);
    return;
}
function writeLog(log, fileName, path) {
    fs.writeFileSync(`${path}/${fileName}.log`, log);
    return;
}
function readstat(a, path) {
    try {
        var readit;
        readit = fs.readFileSync(`${path}/${a}.json`);
    }
    catch (e) {
            readit = createstat(a);
            return JSON.parse(readit);
    }
    return JSON.parse(readit);
}
function readserver(a) {
    try {
        var readit;
        readit = fs.readFileSync(`servers/${a}.json`);
    }
    catch (e) {
        readit = createserver(a);
        return JSON.parse(readit);
    }
    return JSON.parse(readit);
}
function createstat(b) {
    let filebuff = { version: `${version.version}` };
    console.log(colors.blue(`Creating stats for ${b}...`));
    console.log(filebuff);
    filebuff = JSON.stringify(filebuff);
    fs.writeFileSync(`users/${b}.json`, filebuff);
    return filebuff;
}
function createserver(b) {
    let filebuff = { version: `${version.version}`, servername: `${b}`, prefix: "#", admins: " ", spamdelay: 1000};
    console.log(colors.blue(`Creating server file for ${b}...`));
    console.log(filebuff);
    filebuff = JSON.stringify(filebuff);
    fs.writeFileSync(`servers/${b}.json`, filebuff);
    return filebuff;
}
function statupdate(b, c, path) {
    let newfile = { version: `${version.version}` };
    console.log(colors.blue(`Updating stats for ${b}...`));
    newfile = JSON.stringify(newfile);
    fs.writeFileSync(`${path}/${b}.json`, newfile);
    return newfile;
}
function updateserver(oldfile, server) {
    let newfile = { version: `${version.version}`, servername: `${server}`, prefix: "#", admins: " ", spamdelay: 1000};
    console.log(colors.blue(`Updating stats for ${server}...`));
    if (oldfile.version === "0.0.1") {
        newfile.prefix = oldfile.symbol;
    }
    if (oldfile.version === "0.0.1a") {
        newfile.prefix = oldfile.prefix;
    }
    if (oldfile.version === "0.0.2") {
        newfile.prefix = oldfile.prefix;
        newfile.admins = oldfile.admins;
    }
    newfile = JSON.stringify(newfile);
    fs.writeFileSync(`servers/${server}.json`, newfile);
    return newfile;
}
function runEveryDay() {
    hours = hours + 1;
    if (hours >= 24) {
        let now = new Date();
        writeLog(errorlog, `Errors ${months[now.getMonth()]}/${now.getDate()}`, "logs");
        writeLog(outputlog, `Output ${months[now.getMonth()]}/${now.getDate()}`, "logs");
        outputlog = " ";
        errorLog = " ";
        hours = 0;
    }
    return;
}


client.on("error", (e) => {
    let now = new Date();
    console.error(colors.red(`${e}`));
    errorlog = errorlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${e} \n`;
});
client.on("warn", (e) => console.warn(colors.yellow(`${e}`)));
client.on("debug", (e) => console.info(colors.green(`${e}`)));

client.on("ready", () => {
    console.log("Wexel is ready.");
    let numofservers = client.guilds.array();
    numofservers = numofservers.length;
    client.user.setActivity(`on ${numofservers} Servers`, { type: 'PLAYING' });
});

client.on("message", (message) => {
    let now = new Date();
    if (message.author.bot) return;
    let server = message.guild;
    let settings = readserver(server);
    if (settings.version !== version.version) {
        settings = updateserver(settings, server);
    }
    if (message.content[0] === settings.prefix) {
        if (message.member.permissions.has('ADMINISTRATOR') || settings.admins.includes(message.author.id)) {
            if (message.content.includes("wexelchangeprefix")) {
                let strarray = message.content.split(" ");
                strarray = strarray[1];
                strarray = strarray.charAt();
                if (strarray === undefined) {
                    message.channel.send("You must specify a symbol to use as a prefix.");
                    return;
                }
                let badsym = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
                if (badsym.includes(strarray)) {
                    message.channel.send("You cannot set an alphanumeric character as the prefix, please use a symbol");
                    return;
                }
                settings.prefix = strarray;
                message.channel.send(`Wexel prefix is now ${settings.prefix}`);
                console.log(colors.blue(`Server '${server}'s prefix is now ${settings.prefix}`));
                outputlog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} Server '${server}'s prefix is now ${settings.prefix} \n`;
                writeJSON(settings, server, "servers");
                return;
            }
            if (message.content.includes("addadmin")) {
                let newadmin = message.mentions.members.first();
                if (newadmin === undefined) {
                    message.channel.send("You must mention a user to promote to admin status");
                    return;
                }
                if (settings.admins.includes(newadmin.id)) {
                    message.channel.send(`${newadmin.user.tag} is already a Wexel admin of ${server}`);
                    return;
                }
                if (settings.admins === " ") {
                    settings.admins = newadmin.id;
                    console.log(colors.blue(`Adding new admin ${newadmin.user.tag} to server ${server}...`));
                    outputlog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} Adding new admin ${newadmin.user.tag} to server ${server}... \n`;
                    message.channel.send(`Added ${newadmin.user.tag} to server's Wexel admins...`);
                    writeJSON(settings, server, "servers");
                    return;
                }
                settings.admins = settings.admins + newadmin.id;
                console.log(colors.blue(`Adding new admin ${newadmin.user.tag} to server ${server}...`));
                outputlog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} Adding new admin ${newadmin.user.tag} to server ${server}... \n`;
                message.channel.send(`Added ${newadmin.user.tag} to server's Wexel admins...`);
                writeJSON(settings, server, "servers");
                return;
            }
            if (message.content.includes("setspamcooldown")) {
                let strarray = message.content.split(" ");
                strarray = strarray[1];
                if (strarray === undefined) {
                    message.channel.send("You must specify a time in milliseconds to use as a cooldown.");
                    return;
                }
                if (isNaN(strarray)) {
                    message.channel.send(`${strarray} is not a number. Please specify a number in milliseconds to use as a cooldown.`);
                    return;
                }
                settings.spamdelay = strarray;
                console.log(colors.blue(`${message.author.tag} has set ${server}'s spam cooldown to ${settings.spamdelay} ms...`));
                outputlog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${message.author.tag} has set ${server}'s spam cooldown to ${settings.spamdelay} ms... \n`;
                message.channel.send(`Spam cooldown is now set to ${settings.spamdelay} milliseconds.`);
                writeJSON(settings, server, "servers");
                return;
            }
            if (message.content.includes("unmuteuser")) {
                let targetUser = message.mentions.members.first();
                if (targetUser === undefined) {
                    message.channel.send(`You need to specify a user to unmute. Correct syntax is '${settings.prefix}unmuteuser @mention`);
                    return;
                }
                if (muted.has(`${targetUser.id}${message.guild}`) === false) {
                    message.channel.send(`${targetUser.user.tag} is not muted.`);
                    return;
                }
                targetUser.send(`You have been unmuted in ${message.guild}`)
                    .catch(console.error);
                message.delete(50);
                console.log(colors.cyan(`${message.author.tag} in ${message.guild} unmuted ${targetUser.tag}...`));
                outputLog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${message.author.tag} in ${message.guild} unmuted ${targetUser.tag}... \n`;
                muted.delete(`${targetUser.id}${message.guild}`);
                let mutedUsersGuild = targetUser.id + message.guild.id;
                clearTimeout(mutedreseter[mutedUsersGuild]);
                return;
            }
            if (message.content.includes("muteuser")) {
                let targetUser = message.mentions.members.first();
                if (targetUser === undefined) {
                    message.channel.send(`You need to specify a user to mute. Correct syntax is '${settings.prefix}muteuser (seconds to mute) @mention`);
                    return;
                }
                let strArray = message.content.split(" ");
                strArray = strArray[1];
                if (isNaN(strArray)) {
                    message.channel.send(`${strArray} is not a number. Correct syntax is '${settings.prefix}muteuser (seconds to mute) @mention`);
                    return;
                }
                targetUser.send(`You have been muted in ${message.guild} for ${strArray} seconds. If you have any questions on why you were muted, please contact the server's owner.`)
                    .catch(console.error);
                message.delete(50);
                console.log(colors.cyan(`${message.author.tag} in ${message.guild} muted ${targetUser.tag} for ${strArray} seconds...`));
                outputLog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${message.author.tag} in ${message.guild} muted ${targetUser.tag} for ${strArray} seconds... \n`;
                strArray = strArray * 1000;
                muted.add(`${targetUser.id}${message.guild}`);
                let mutedUsersGuild = targetUser.id + message.guild.id;
                mutedreseter[mutedUsersGuild] = setTimeout(unmuteUser, strArray, `${targetUser.id}${message.guild}`, targetUser.tag);
                return;
            }
        }
    }
    if (muted.has(`${message.author.id}${message.guild}`)) {
        message.delete(50);
        console.log(colors.cyan(`Deleted message from ${message.author.tag} due to mute...`));
        outputlog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} Deleted message from ${message.author.tag} due to mute... \n`;
    }
    if (talkedRecently.has(message.author.id)) {
        message.delete(50);
        console.log(colors.cyan(`Deleted message from ${message.author.tag} due to spam...`));
        outputlog = outputlog + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} Deleted message from ${message.author.tag} due to spam... \n`;
        clearTimeout(talkreseter[message.author.id]);
        talkreseter[message.author.id] = setTimeout(removefromtalkedrecently, settings.spamdelay, message.author.id);
    }
    talkedRecently.add(message.author.id);
    talkreseter[message.author.id] = setTimeout(removefromtalkedrecently, settings.spamdelay, message.author.id);
});
