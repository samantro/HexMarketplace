const Marketplace =  require('../contracts/ethereum-contracts/Marketplace.json');
const BoredPetsNFT =  require('../contracts/ethereum-contracts/BoredPetsNFT.json');

const Web3 =  require('web3');
const axios = require('axios')

var web3 = new Web3('https://rpc-mumbai.maticvigil.com')

async function c(params) {
  console.log(await params)
}

async function myListedNFTs(_address) {
    const networkId = await web3.eth.net.getId()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    const boredPetsContract = new web3.eth.Contract(BoredPetsNFT.abi, BoredPetsNFT.networks[networkId].address)
    const data = await marketPlaceContract.methods.getMyListedNfts().call({from: _address})
    
    const nfts = await Promise.all(data.map(async i => {
      try {
        var meta = await boredPetsContract.methods.tokenURI(i.tokenId).call()
        meta = JSON.parse(meta);
        
        let nft = {
          price: i.price,
          tokenId: i.tokenId,
          seller: i.seller,
          name: meta.name,
          description: meta.description,
          image: meta.image
        }
        return nft;
      } 
      catch(err) {
        console.log(err)
        return null
      }
    }))
    return nfts;
}

c(myListedNFTs('0xC7268C02d20C0eef02aE7E418C0B5C8a7ACec95a'))
module.exports = {myListedNFTs}




