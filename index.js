const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
bot.mutes = require('./mutes.json');
let config = require('./botconfig.json');
let token = config.token;
let prefix = config.prefix;
let profile = require('./warnings.json');
const { connect } = require('http2');
fs.readdir('./cmds/',(err,files)=>{
    if(err) console.log(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <=0) console.log("Нет комманд для загрузки!!");
    console.log(`Загружено ${jsfiles.length} комманд`);
    jsfiles.forEach((f,i) =>{
        let props = require(`./cmds/${f}`);
        console.log(`${i+1}.${f} Загружен!`);
        bot.commands.set(props.help.name,props);
    });
});


bot.on('ready', () => {
    console.log(`Запустился бот ${bot.user.username}`);
    bot.generateInvite(["ADMINISTRATOR"]).then(link =>{
        console.log(link);
    });
    bot.setInterval(()=>{
        for(let i in bot.mutes){
            let time = bot.mutes[i].time;
            let guildid = bot.mutes[i].guild;
            let guild = bot.guilds.cache.get(guildid);
            let member = guild.members.cache.get(i);
            let muteRole = member.guild.roles.cache.find(r => r.name === "Muted"); 
            if(!muteRole) continue;

            if(Date.now()>= time){
                member.roles.remove(muteRole);
                delete bot.mutes[i];
                fs.writeFile('./mutes.json',JSON.stringify(bot.mutes),(err)=>{
                    if(err) console.log(err);
                });
            }
        }

    },5000)

});
bot.on('guildMemberAdd',(member)=>{
    let role = member.guild.roles.cache.find(r => r.name === "✦People✦");
    member.roles.add(role) 
});

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
    let uid = message.author.id;
    bot.send = function (msg){
        message.channel.send(msg);
    };
    if(!profile[uid]){
        profile[uid] ={
            coins:10,
            xp:0,
            lvl:1,
        };
    };
    let u = profile[uid];

    u.coins++;
    u.xp++;

    if(u.xp>= (u.lvl * 5)){
        u.xp = 0;
        u.lvl += 1;
    };


    fs.writeFile('./warnings.json',JSON.stringify(profile),(err)=>{
        if(err) console.log(err);
    });

    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
    if(!message.content.startsWith(prefix)) return;
    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot,message,args);
    bot.rUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    bot.uId = message.author.id;
 
});
bot.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === '︱🧸-welcome-🧸')
  if (!channel) return;
  channel.send(`Добро пожаловать на сервер Домик Пингвиненка, ${member}`);

});
bot.on("ready" , () => {
    console.log("Готов к работе!");
   bot.user.setStatus("dnd"); 
   bot.user.setActivity("Домик Пингвиненка",{type:"STREAMING",url:"https://www.twitch.tv"})
}); 
bot.on('message', async message => {
    
    if (!message.guild) return;
  
    if (message.content === '!join') {
      
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
      } else {
        message.reply('You need to join a voice channel first!');
      }
    }
  }); 
  bot.on('ready', () => {
    console.log('труньк!');
  });
  
 
  bot.on('message', message => {
    
    if (message.content === '!avatar') {
     
      message.reply(message.author.displayAvatarURL());
    }
  });
  bot.on('ready', () => {
    console.log('I am ready!');
  });
  bot.on('message', message => {
 
    if (message.content === '!help') {
      
   
      let embed = new Discord.MessageEmbed()
        .setTitle('Команды.')
        
        .setColor(0x00e9ff)
      
        .setDescription('⚡ !mute , !ban, !warn, !ping, !serverinfo, !userinfo , !say, !clear, !kick, !unmute, !avatar ⚡');
    
      message.channel.send(embed);
    
    }
});
  module.exports.help = {
      name: "help"
  };

bot.login(token);  
