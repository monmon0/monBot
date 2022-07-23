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

const Discord = require('discord.js');
const TOKEN = "MTAwMDI0MDkzNDMwMDE1NjAwNg.GMdHTh.CxLvLoo_srRHblv5N5mo1taNQQlT7CozuPYZ8o"

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

//****************************** Web3 config *******************************/
//*************************************************************************/



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
    
    // await sendListingMessage( {auctioneer-name}, event.transaction.contractCall.params.reservePrice);
//       await bidOnAuction(event.transaction.contractCall.params.nftContract, event.transaction.contractCall.params.tokenId, ;
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
const blocknative = new BlocknativeSdk.default(options)


// //**************************************************************************/
// //*************************************************************************/


//****************************** Bot Logic :-) *****************************/
//*************************************************************************/


const fndAddress = '0xcda72070e455bb31c7690a170224ce43623d0b6f';

// //todo change auctioneer to whoever is running an auction u want to watch
const auctioneer = '0xc7993345f7De52d76fcc855923790c58CecE8B80';


const watchAuction = async(auctionAuthor) => {
    await blocknative.configuration({
        scope: fndAddress,
        filters: [
            {
              "contractCall.methodName": "createReserveAuction"
            },
            {
              "status": "confirmed"
            },
            { "from": auctionAuthor }
          ],
        abi: fndAbi,
        watchAddress: true
    })
}

// send listing message to designated chanel
const sendListingMessage = async(author, price) => {
  const channel = client.channels.cache.get("1000308793634205780");
  await channel.send(`${author} has listed a new piece for ${price}`);
  console.log('bot is sending message');
}
// const bidOnAuction = async(nftContract, tokenId, price)=> {
//   const fndContract = await new web3.eth.Contract(fndAbi, fndAddress);
//   const auctionId = await fndContract.methods.getReserveAuctionIdFor(nftContract, tokenId).call();
//   //const sixNinePrice = price + 69000000000000000;
//   try{
//     console.log('BIDDING!!!');

//     const bid = await fndContract.methods.placeBidV2(auctionId, bidPrice, REFERRER).send({from: web3.eth.accounts._provider.addresses[0], value: bidPrice});
//     console.log('SENT BID!!');
//     console.log(bid);
//   } catch (e){
//     //let error = JSON.parse(e.message);
//     console.log(e);
//   }

//   console.log(auctionId);
// }


watchAuction(auctioneer);

client.login(TOKEN);









/// I DONT THINK I NEED THIS

// let provider = new HDWalletProvider({
//   mnemonic: secret,
//   providerOrUrl: 'https://eth-mainnet.public.blastapi.io',
//   pollingInterval:1000,
//   addressIndex: [1]
// });


//**************************************************************************/
//*************************************************************************/

// const web3 = new Web3(provider);

// console.log(web3.eth.accounts._provider.addresses[0])
