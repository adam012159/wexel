# wexel
A discord bot

Use of wexel requires addition of a file called 'config.json' to the root, with a line like this: (include quotes)

{"token": "[Your bots token]"}

Where [Your bots token] is replaced with the token generated from your discord bot. more information can be found here:
https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

Currently, Wexel's development is focused on adding anti-spam abilities. This will include chat cooldowns, setable by admins, a system
that detects newly-made users and send a pm authenticating them, and kicks based on how often they spam. Long-term goals include a 
plethora of admin abilities, including the ability to add admins for Wexel commands without granting Admin role on discord.
