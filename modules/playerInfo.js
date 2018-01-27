'use strict';

const fs = require('fs');
const path = require('path');

const apifcraftpl = require('api-fcraft.pl');
const Discord = require('discord.js');
const moment = require('moment');

const utils = require(path.join(__dirname, '..', 'utils.js'));

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json')));

const apiClient = new apifcraftpl(config.key);

module.exports = async (message) => {
    try {
        const args = message.content.split(/\s+/);

        if(!args[1]) {
            message.reply('prawidłowe użycie: `!gracz <gracz>`!');
        } else {
            apiClient.globalPlayer(args[1]).then(async (player) => {
                const embed = new Discord.RichEmbed();
                embed.setAuthor('Informacje o graczu', 'https://wiki.fcraft.pl/images/e/e3/W%C5%82asno%C5%9B%C4%87.png');
                embed.setColor('FFF000');
                embed.setThumbnail(`https://api.fcraft.pl/player/${args[1]}/head?size=16`);

                const nickname = await apiClient.resolverUuids([player.uuid]);
                embed.addField('Gracz', utils.escapeMarkdown(nickname[player.uuid]), true);

                embed.addField('Konto', (player.premium.last ? 'Oryginalne' : 'Pirackie'), true);
                embed.addField('Pierwsze wejście', moment(player.time.first * 1000).format('D.MM.YYYY H:mm'), true);
                embed.addField('Ostatnie wejście', moment(player.time.last * 1000).format('D.MM.YYYY H:mm'), true);

                const isActive = moment(player.time.last * 1000).isSameOrAfter(moment().subtract(30, 'days'));
                embed.addField('Aktywny', (isActive ? 'Tak' : 'Nie'), true);

                const bans = await apiClient.banList();

                if(bans.find(ban => ban.uuid === player.uuid)) {
                    embed.addField('Zbanowany', 'Tak', true);
                } else {
                    embed.addField('Zbanowany', 'Nie', true);
                }

                message.channel.send(embed);
            }).catch(error => {
                message.reply('nie można było uzyskać informacji nt. podanego gracza!');
            });
        }
    } catch(error) {
        message.reply('wystąpił błąd!');
        console.error(error);
    } finally {
        message.channel.stopTyping();
    }
};
