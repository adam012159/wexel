const Discord = require("discord.js");
const colors = require("colors/safe");
const fs = require('fs');
const client = new Discord.Client();
const config = require("./config.json");
const version = require("./version.json");
const talkedRecently = new Set();
const talkreseter = new Set();

client.login(config.token);

function removefromtalkedrecently(name) {
    talkedRecently.delete(name);
    return;
}
function write(a, b, path) {
    a = JSON.stringify(a);
    fs.writeFileSync(`${path}/${b}.json`, a);
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

client.on("error", (e) => {
    let now = new Date();
    console.error(colors.red(`${e}`));
    client.channels.get("456482534482509835").send("An error has occured. Please check log for more information.");
    write(e, `error${now}`, "logs");
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
                write(settings, server, "servers");
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
                    message.channel.send(`Added ${newadmin.user.tag} to server's Wexel admins...`);
                    write(settings, server, "servers");
                    return;
                }
                settings.admins = settings.admins + newadmin.id;
                console.log(colors.blue(`Adding new admin ${newadmin.user.tag} to server ${server}...`));
                message.channel.send(`Added ${newadmin.user.tag} to server's Wexel admins...`);
                write(settings, server, "servers");
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
                message.channel.send(`Spam cooldown is now set to ${settings.spamdelay} milliseconds.`);
                write(settings, server, "servers");
                return;
            }
        }
    }
    if (talkedRecently.has(message.author.id)) {
        message.delete(50);
        console.log(colors.cyan(`Deleted message from ${message.author.tag} due to spam...`));
        clearTimeout(talkreseter[message.author.id]);
        talkreseter[message.author.id] = setTimeout(removefromtalkedrecently, settings.spamdelay, message.author.id);
    }
    talkedRecently.add(message.author.id);
    talkreseter[message.author.id] = setTimeout(removefromtalkedrecently, settings.spamdelay, message.author.id);
});
