// For Node < v13 / CommonJS environment
const BlocknativeSdk = require('bnc-sdk');
const WebSocket = require('ws');
const Web3 = require('web3');

const fndAbi = require('./fndAbi.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const axios = require('axios');
const apiKey = 'ab229f86-095d-41d8-9d7d-5fda94c7fa4b';
const gasApi = 'https://api.blocknative.com/gasprices/blockprices';

const { request, gql, GraphQLClient } = require('graphql-request')
const query_api = "https://hasura2.foundation.app/v1/graphql";
const { GET_PROFILE } = require('./graphql_constants');
const graphQlClient = new GraphQLClient(query_api, {})

const { SlashCommandBuilder, Routes, AttachmentBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token } = require('./config.json');

const winnie = "https://c.tenor.com/MqIJqEF_ldEAAAAC/eyebrow-up-winnie-the-pooh.gif";
const { readFile } = require('fs/promises');
const Canvas = require('@napi-rs/canvas');

const Discord = require('discord.js');
// const TOKEN = "MTAwMDI0MDkzNDMwMDE1NjAwNg.GMdHTh.CxLvLoo_srRHblv5N5mo1taNQQlT7CozuPYZ8o"

const {readFileSync, promises: fsPromises} = require('fs');

const contents = readFileSync("./address.txt", 'utf-8').split('\n');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
}) 


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
}) 


const auctionObject = {};

const transactionHandler = async(event) => {

    auctionObject.from = event.transaction.from;
    auctionObject.status = event.transaction.status;
    auctionObject.nftContract = event.transaction.contractCall.params.nftContract;
    auctionObject.tokenId = event.transaction.contractCall.params.tokenId;
    auctionObject.price = event.transaction.contractCall.params.reservePrice;

    console.log(event.transaction.from);
    console.log(event.transaction.status);
    console.log(event.transaction.contractCall.params.nftContract);
    console.log(event.transaction.contractCall.params.tokenId);
    console.log(event.transaction.contractCall.params.reservePrice);

    console.log(contents.includes(event.transaction.from));
  if(contents.includes(event.transaction.from)){
   await sendListingMessage(event.transaction.from, event.transaction.contractCall.params.reservePrice, event.transaction.contractCall.params.nftContract, event.transaction.contractCall.params.tokenId);
   console.log('sending listing message');
  }
}

const options = {
  dappId: apiKey,
  networkId: 1,
  //system: 'bitcoin', // optional, defaults to ethereum
  transactionHandlers: [transactionHandler],
  ws: WebSocket, // only neccessary in server environments 
  //name: 'Instance name here', // optional, use when running multiple instances
  onerror: (error) => {console.log(error)} //optional, use to catch errors
}

// initialize and connect to the api
const blocknative = new BlocknativeSdk(options)

//****************************** Bot Logic :-) *****************************/
//*************************************************************************/


const getProfile = async(author) => {
  const variables = {}
  variables.publicKey = author

  let response;

  response = await graphQlClient.request(GET_PROFILE, variables)
  console.log(response)

  if(response.user){
    return response.user.username;
  } else {
    return author;
  }
  
}

const getFndLink = async(author, profile, nftContract, tokenId) => {
  const api = 'https://jr5ltvzcse-dsn.algolia.net/1/indexes/artworks_sort_default/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.12.1)%3B%20Browser%20(lite)&x-algolia-api-key=1ae2d43a2816a05df9d1e053907048bc&x-algolia-application-id=JR5LTVZCSE';
  let query = {"query":"","facetFilters":["moderationStatus:ACTIVE","isDeleted:false",`creator.publicKey:${author}`],"filters":"","page":0,"hitsPerPage":48}
  let response = await axios.post(api, query);
  console.log(response);

  let nftArray = response.data.hits;
  let slug;
  //for each nft in the array, check if it matches the nftContract and tokenId
  for(let i = 0; i < nftArray.length; i++){
    if(nftArray[i].tokenId == tokenId && nftArray[i].collection.contractAddress == nftContract) {
      slug = nftArray[i].collection.slug;
    }
  }
  const link = `https://foundation.app/${profile}/${slug}/${tokenId}`;
  console.log(link);
  return link;

}

const fndAddress = '0xcda72070e455bb31c7690a170224ce43623d0b6f';

// //todo change auctioneer to whoever is running an auction u want to watch
const auctioneer = '0xc7993345f7De52d76fcc855923790c58CecE8B80';


const watchAuction = async() => {
    await blocknative.configuration({
        scope: fndAddress,
        filters: [
            {
              "contractCall.methodName": "createReserveAuction"
            },
            {
              "status": "confirmed"
            },
          ],
        abi: fndAbi,
        watchAddress: true
    })
}


// send listing message to designated chanel
const sendListingMessage = async(author, price, nftContract, tokenId) => {
  const actualPrice = Web3.utils.fromWei(price.toString(), 'ether');
  const channel = client.channels.cache.get("1000594845980700722"); // change to artisp server
  const profile = await getProfile(author);
  const link = await getFndLink(author, profile, nftContract, tokenId);
  await channel.send(
    `───✱*.｡:｡✱*.:｡✧*.｡✰ ─── \n
    **${profile}** is here to steal your ETH for **${actualPrice}** ETH \n
    ┊ ⋆ ┊ . ┊ ┊ ┊ ⋆ ┊ . ┊ ┊\n
    ┊ ⋆ ┊ . ┊ ┊ ┊ ⋆ ┊ . ┊ ┊ \n
    ↳-ˏˋBID NOWˊˎ- ↴ \n
    ${link}
    `);
  console.log('bot is sending message');
}




//********************SLASH COMMANDS BBY***************************************/
//*************************************************************************/

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return context.font;
};
let wordleRecord = [];
let contestantsRecord = [];
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;
  

	if (commandName === 'god') {
		await interaction.reply(`You are in indeed a god **${interaction.user.tag}**\n${winnie}`);

	} else if (commandName === 'rekt') {
		// await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    const canvas = Canvas.createCanvas(400, 400);
		const context = canvas.getContext('2d');

    const user = interaction.options.getUser('target');
    
    const backgroundFile = await readFile('./wallpaper.jpeg');
    const background = new Canvas.Image();
    background.src = backgroundFile;

    // This uses the canvas dimensions to stretch the image onto the entire canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

		context.strokeStyle = '#0099ff';
		context.strokeRect(0, 0, canvas.width, canvas.height);

		context.font = applyText(canvas, `${interaction.member.displayName}`);
		context.fillStyle = '#ffffff';
		context.fillText(`${interaction.member.displayName}`, canvas.width / 2.5, canvas.height / 6);


		context.font = "28px sans-serif";
		context.fillText(`hopes you get rekt`, canvas.width/6, canvas.height / 4);

		context.beginPath();
		context.arc(125, 125, 100, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

    // Use the helpful Attachment class structure to process the file for you
    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });

    if(user === null){
      interaction.reply(`**${interaction.member.displayName}** hopes you get rekt`)
    }else{
      interaction.reply(`**${interaction.member.displayName}** hopes ${user} get rekt`);
    }
    
    interaction.channel.send({ files: [attachment] });

	 } else if (interaction.commandName === 'wordle') {
    const wordleNum = interaction.options.getInteger('int')
    const contestant = interaction.user.id
    wordleRecord.push(wordleNum);
    contestantsRecord.push(contestant);

    if(wordleNum <= 3){
      await interaction.reply({ content: `Your record of ${wordleNum}/6 is registered \n Congrats, <@${contestant}> have good chances of winning!`, ephemeral: true });
    }else if(wordleNum <= 6){
      await interaction.reply({ content: `Your record of ${wordleNum}/6 is registered \n Eh, <@${contestant}> sucks even in Spelling Bee aye?`, ephemeral: true });
    }else{
      await interaction.reply({ content: `Itzoke, Mon can introduce <@${contestant}> to her 6 yo cousin. \n You guys will hit it off with your vocab similarity`, ephemeral: true });
    }
	} 
  else if (interaction.commandName === 'wordlegod' && interaction.user.id === "959190012480618566" && wordleRecord.length > 0) {
    console.log(wordleRecord);
    const winnerList = [];
    let todayWinner = Math.min(...wordleRecord);
    console.log(todayWinner);


    if(todayWinner <= 6){
      for(let i=0; i<wordleRecord.length;i++){
        if(wordleRecord[i] === todayWinner){
        winnerList.push(contestantsRecord[i]);
      }
      }
      ////////
      const canvas = Canvas.createCanvas(300, 450);
      const context = canvas.getContext('2d');
  
      const backgroundFile = await readFile('./winner.jpeg');
      const background = new Canvas.Image();
      background.src = backgroundFile;
    
      // This uses the canvas dimensions to stretch the image onto the entire canvas
      context.drawImage(background, 0, 0, canvas.width, canvas.height);
  
      context.strokeStyle = '#0099ff';
      context.strokeRect(0, 0, canvas.width, canvas.height);
  
    
      if(winnerList.length === 1){
        let user = client.users.cache.get(winnerList[0]);
        console.log(user.username)
        context.font = '28px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText(`${user.username} be like:`, canvas.width / 5, canvas.height / 6);  
  
      } else{
        context.font = '20px sans-serif';
        context.fillStyle = '#ffffff';
        for(let i=0; i< winnerList.length;i++){
          let user = client.users.cache.get(winnerList[i]);
          context.fillText(`${user.username},`, canvas.width / 10 + i*(canvas.width/winnerList.length), canvas.height / 8);
        }
  
        context.font = '28px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText("BE LIKE:", canvas.width / 4, canvas.height / 5);
      }
  
    // Use the helpful Attachment class structure to process the file for you
      const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });
  
      //////////
      console.log(winnerList);
      await interaction.reply("THE RESULT ARE IN 🏆")
      for(let i=0; i < winnerList.length; i++){
        await interaction.channel.send(`.·:*¨༺ ༻¨*:·. \n Congrats <@${winnerList[i]}> for becoming **Wordle God** Of The day \n *ੈ✩‧₊˚ ALL HAIL <@${winnerList[i]}> with ${todayWinner}/6 •°. *࿐`)
      }
      await interaction.channel.send({ files: [attachment] });
     
      
      for(let i=0; i<winnerList.length; i++){
        const index = wordleRecord.indexOf(todayWinner);
        if (index > -1) { // only splice array when item is found
          wordleRecord.splice(index, 1); // 2nd parameter means remove one item only
          contestantsRecord.splice(index, 1)
        }
        console.log(wordleRecord);
      }
      const contestantNum = contestantsRecord.length;
      const date = interaction.options.getString('date')
      if(contestantNum > 0){
      interaction.channel.send(`┌──═━ Today ${date} Wordle Leaderboard┈━═──┐`)
        for(let i=0; i<contestantNum; i++){
        const instant = Math.min(...wordleRecord);
        const index = wordleRecord.indexOf(instant);
        if(i === 0){
          interaction.channel.send(`<@${contestantsRecord[index]}> placed **2nd** with ${instant}/6. Very bery close, hope you get your revenge soon!`)
        } else if(i === 1){
          interaction.channel.send(`<@${contestantsRecord[index]}> placed **3rd** with ${instant}/6. Ah at least you made it to top 3!`)
        }else if(instant <=6){
          const placing = i+2;
          interaction.channel.send(`<@${contestantsRecord[index]}> placed **${placing}th** with ${instant}/6. Eh, who care what you placed if not top 3`)
        }
        else{
          interaction.channel.send(`<@${contestantsRecord[index]}> has failed. Better luck next time or it can be really embarrassing`)
        }
        if (index > -1) { // only splice array when item is found
          wordleRecord.splice(index, 1); // 2nd parameter means remove one item only
          contestantsRecord.splice(index, 1)
        }
        console.log(wordleRecord);
      }
      }
      interaction.channel.send(`╚══════════════《✧》══════════════╝ \n Sincere thank you to all participants \n This is all under the *friendly spirit* of the NYT Wordle \n https://www.nytimes.com/games/wordle/index.html`)

      wordleRecord = [];
      contestantsRecord = [];
    } else{
      await interaction.reply("What a dissapointment. We all failed. Human has failed as a race smh")
      console.log(wordleRecord);
      for(let i=0; i<wordleRecord.length; i++){
      interaction.channel.send(`<@${contestantsRecord[i]}> enters ${wordleRecord[i]}`)
      }
    }
  }

});

watchAuction();

client.login(token);

