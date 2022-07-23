// const Web3 = require('web3');
// const fndAbi = require('./fndAbi.json');
// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const fs = require('fs');
// const secret = fs.readFileSync(".secret").toString().trim();



// //****************************** Web3 config *******************************/
// //*************************************************************************/



// let provider = new HDWalletProvider({
//   mnemonic: secret,
//   providerOrUrl: 'https://eth-mainnet.public.blastapi.io',
//   pollingInterval:1000,
//   //addressIndex: [1]
// });

// const web3 = new Web3(provider);

// console.log(web3.eth.accounts._provider.addresses[0])



// //****************************** Bot Logic :-) *****************************/
// //*************************************************************************/


// const fndAddress = '0xcda72070e455bb31c7690a170224ce43623d0b6f';

// //const REFERRER = '0x9FD6B3759cD2758cFD4C13565EA621c4C0677648'
// const REFERRER = '0xE2AF30a97881DA126be19575f55AC9c8f20A9538'

// const bidPrice = web3.utils.toWei('1.069', 'ether');
// const nftContract = '0xa587a2d4706777421d3500f5e165b945dcb005ee'
// const id = 1;


//  const bidOnAuction = async()=> {
//   const fndContract = await new web3.eth.Contract(fndAbi, fndAddress);
//   const auctionId = await fndContract.methods.getReserveAuctionIdFor(nftContract, id).call();
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



// //test();
// bidOnAuction();