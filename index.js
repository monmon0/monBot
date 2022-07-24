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
    
   await sendListingMessage(event.transaction.from, event.transaction.contractCall.params.reservePrice, event.transaction.contractCall.params.nftContract, event.transaction.contractCall.params.tokenId);
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
const sendListingMessage = async(author, price, nftContract, tokenId) => {
  const actualPrice = Web3.utils.fromWei(price.toString(), 'ether');
  const channel = client.channels.cache.get("1000308793634205780");
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


//cant do await below so this wont work
//const username = getProfile(auctioneer);


watchAuction(auctioneer);

//getProfile(auctioneer);
//getFndLink(auctioneer);

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
