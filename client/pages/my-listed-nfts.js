import Web3 from 'web3';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import Marketplace from '../../contracts/optimism-contracts/Marketplace.json';
import BoredPetsNFT from '../../contracts/optimism-contracts/BoredPetsNFT.json';

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
    // console.log("metamask accounts "+accounts[1]);
    const listings = await marketPlaceContract.methods.getMyListedNfts().call({from: accounts[0]})
    // console.log("selected account "+accounts[0]);
    // console.log("my listed nfts = " + listings );
    // Iterate over my listed NFTs and retrieve their metadata
    const nfts = await Promise.all(listings.map(async i => {
      //alert("iterator = " + i);
      try {
        //alert("loadNfts inside try : price,tokenId,seller....= " + i.price + " " + i.tokenId + " " + i.seller);
        const boredPetsContract = new web3.eth.Contract(BoredPetsNFT.abi, BoredPetsNFT.networks[networkId].address)
        const tokenURI = await boredPetsContract.methods.tokenURI(i.tokenId).call();
        //alert("tokenUri inside the try"+tokenURI);
        //const meta = await axios.get(tokenURI);
        //alert("meta.data " + meta.data);
        //alert("Nfts inside try: image url....= " + meta.data.image);
        let item = {
          price: i.price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          //image: meta.data.image,
          image: tokenURI,
        }
        return item
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
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">Price - {Web3.utils.fromWei(nft.price, "ether")} Eth</p>
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
