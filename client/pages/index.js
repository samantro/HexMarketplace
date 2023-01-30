import Web3 from 'web3';
import Web3Modal from 'web3modal';
import {allNFTs} from '../salesforce/allNFTs'
import { useEffect, useState } from 'react';
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import Footer from './footer';
import LoaderComponent from './loader';


export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metamask, setMetamask] = useState();

  async function noLoginNFTs() {
    const nfts = await allNFTs();
    setNfts(nfts);
    setNfts(nfts.filter(nft => nft !== null))
    setLoading(false)
  }

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
        console.log(err)
        return null
      }
    }))
    setNfts(nfts.filter(nft => nft !== null))
    setLoading(false)
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId();
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
    const accounts = await web3.eth.getAccounts();
    await marketPlaceContract.methods.buyNft(nft.tokenId).send({ from: accounts[0], value: nft.price });
    loadNFTs()
  }

  useEffect(() => {
    if(window.ethereum) 
      loadNFTs()
    else {
      setMetamask(false);
      if(window.confirm('Install Metamask extension for complete experience.')) {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank');
      }
      else {
        noLoginNFTs();
      }
    }
  },[])

if(loading) {
  return LoaderComponent();
}
else
  if(!nfts.length) {
    return (<h1 className="px-20 py-10 text-3xl" style={{textAlign:"center",color:"grey"}}> No NFT available!</h1>)
  } else {
    return (
      <>
        <div className="flex justify-center bg-slate-100 pb-20">
          <div className="px-4" style={ { maxWidth: '1600px' } }>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-5">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden bg-white scale-95 hover:scale-105">
                  <img src={nft.image} className="rounded" style={{height:'18rem'}}/>
                  <div className="p-4">
                    <p className="text-2xl font-semibold">{nft.name}</p>
                    <p className="text-blue-400 text-xl">{nft.description}</p>
                    <button className="mt-4 w-full bg-sky-400 hover:bg-sky-600 text-white font-bold py-2 px-12 rounded" 
                        onClick={() => buyNft(nft)}>
                        {Web3.utils.fromWei(nft.price, "ether")} ETH
                    </button>
                  </div>
                </div>
              ))
            }
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }
}
