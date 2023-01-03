const Marketplace =  require('../../contracts/optimism-contracts/Marketplace.json');
const BoredPetsNFT =  require('../../contracts/optimism-contracts/BoredPetsNFT.json');
const Web3 =  require('web3');
const axios = require('axios')

var web3 = new Web3('https://rpc-mumbai.maticvigil.com')

function c(params) {
  console.log(params)
}

async function allNFTs() {
    const networkId = await web3.eth.net.getId()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    const boredPetsContract = new web3.eth.Contract(BoredPetsNFT.abi, BoredPetsNFT.networks[networkId].address)
    const data = await marketPlaceContract.methods.getListedNfts().call()
    // new added 
    c("GET 200 \n allNFTs \n")
    const aNfts = [];
    
    const nfts = await Promise.all(data.map(async i => {
      try {
        const tokenURI = await boredPetsContract.methods.tokenURI(i.tokenId).call()
        if(tokenURI !== "URI1"){
          // const meta = await axios.get(tokenURI)
          let nft = {
            price: i.price,
            tokenId: i.tokenId,
            seller: i.seller,
            tokenURI: tokenURI
          }
        
          // console.log(nft);
          aNfts.push(nft);
          return nft
      }
      } catch(err) {
        console.log(err)
        return null
      }
    }))
    return aNfts;

}
// allNFTs();
module.exports = {allNFTs}




