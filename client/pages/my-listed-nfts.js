import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { useEffect, useState } from 'react';
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => { loadNFTs() }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()

    // Get listed NFTs
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    const accounts = await web3.eth.getAccounts()
    const listings = await marketPlaceContract.methods.getMyListedNfts().call({from: accounts[0]})
    
    const nfts = await Promise.all(listings.map(async i => {
      try {
        var meta = await  marketPlaceContract.methods.tokenURI(i.tokenId).call()
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
        console.log(err)
        return null
      }
    }))
    setNfts(nfts.filter(nft => nft !== null))
    setLoadingState('loaded')
  }

  if (loadingState === 'loaded' && nfts.length===0) {
    return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  } else {
    return (
      <div>
        <div className="p-4">
          <h2 className="text-2xl py-2">Items Listed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={nft.image} className="rounded" />
                  <div className="p-4">
                    <p className="text-2xl font-semibold">{nft.name}</p>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-2xl font-bold">{Web3.utils.fromWei(nft.price, "ether")} Eth</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}
