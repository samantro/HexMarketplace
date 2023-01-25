const Web3 =  require('web3');
var web3 = new Web3('https://rpc-mumbai.maticvigil.com');
const Marketplace =  require('../contracts/ethereum-contracts/Marketplace.json');

async function listedNFTs(_address) {
    const networkId = await web3.eth.net.getId()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    const data = await marketPlaceContract.methods.getMyNfts().call({from: _address})
    var nfts = await Promise.all(data.map(async (i) => {
      try {
        var meta = await marketPlaceContract.methods.tokenURI(i.tokenId).call()
        meta = JSON.parse(meta);
        
        let nft = {
          price: i.price,
          tokenId: i.tokenId,
          seller: i.seller,
          name: meta.name,
          description: meta.description,
          image: meta.image
        }
        return nft
      } catch(err) {
        console.log('err')
        return null
      }
    }))
    nfts = nfts.filter(nft => nft !== null)
    return nfts;
}
module.exports = {listedNFTs}




