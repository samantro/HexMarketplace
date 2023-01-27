import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { useEffect, useState } from 'react';
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import Footer from './footer';

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


  if (loadingState === 'loaded' && !nfts.length) {
    return (<h1 className="px-20 py-10 text-3xl bg-slate-100" style={{textAlign:"center",color:"grey"}}> No NFT Listed!</h1>)
  } else {
    return (
      <>
        <div className="p-4 bg-slate-100 pb-20">
          {/* <h2 className="text-2xl py-2">Items Listed</h2> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden bg-white scale-95 hover:scale-105">
                  <img src={nft.image} className="rounded" style={{height:'20rem'}}/>
                  <div className="p-4 text-xl">
                    <p className="text-2xl font-semibold">{nft.name}</p>
                    <p className="text-blue-400 text-xl">{nft.description}</p>
                    <p>{Web3.utils.fromWei(nft.price, "ether")} ETH</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <Footer />
      </>
    )
  }
}
