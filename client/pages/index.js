import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Marketplace from '../../contracts/optimism-contracts/Marketplace.json'
import BoredPetsNFT from '../../contracts/optimism-contracts/BoredPetsNFT.json'
const logo= "data:image/png;base64,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";


export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => { loadNFTs() }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()
    console.log(networkId);

    // Get all listed NFTs
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    const listings = await marketPlaceContract.methods.getListedNfts().call()
    // Iterate over the listed NFTs and retrieve their metadata
    const nfts = await Promise.all(listings.map(async (i) => {
      try {
        const boredPetsContract = new web3.eth.Contract(BoredPetsNFT.abi, BoredPetsNFT.networks[networkId].address)
        console.log(i.tokenId);
        const tokenURI = await boredPetsContract.methods.tokenURI(i.tokenId).call()
        const meta = await axios.get(tokenURI)
        const nft = {
          price: i.price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.buyer,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
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

  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId();
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
    const accounts = await web3.eth.getAccounts();
    await marketPlaceContract.methods.buyNft(BoredPetsNFT.networks[networkId].address, nft.tokenId).send({ from: accounts[0], value: nft.price });
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return (<h1 className="px-20 py-10 text-3xl">No pets available!</h1>)
  } else {
    return (
      <div className="flex justify-center">
        <div className="px-4" style={ { maxWidth: '1600px' } }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  
                  <div className="p-4">
                    {/* <p style={ { height: '64px' } } className="text-2xl font-semibold">{nft.name}</p> */}
                    <img srcset={logo} className="rounded" />
                    {/* <div style={ { height: '70px', overflow: 'hidden'  } }>
                    
                    </div> */}
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">{Web3.utils.fromWei(nft.price, "ether")} ETH</p>
                    <button className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
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
