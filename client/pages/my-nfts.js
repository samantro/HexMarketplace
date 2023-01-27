import Web3 from 'web3';
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import Footer from './footer';

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()

  useEffect(() => { loadNFTs() }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    const accounts = await web3.eth.getAccounts()
    const data = await marketPlaceContract.methods.getMyNfts().call({from: accounts[0]})
    // alert(data);
    const nfts = await Promise.all(data.map(async i => {
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
    setLoadingState('loaded')
  }

  function listNFT(nft) {
    router.push(`/resell-nft?id=${nft.tokenId}&image=${nft.image}`)
  }

 
  if (loadingState === 'loaded' && !nfts.length) {
    return (<h1 className="px-20 py-10 text-3xl" style={{textAlign:"center",color:"grey"}}> No NFT Owned!</h1>)
  } else {
    return (
      <>
        <div className="flex justify-center bg-slate-100 pb-20">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden bg-white">
                  <img src={nft.image} className="rounded" style={{height:'18rem'}}/>
                  <div className="p-4">
                    <p className="text-2xl font-semibold">{nft.name}</p>
                    <p className="text-blue-400 text-xl">{nft.description}</p>
                    <p className="text-2xl font-bold">Price : {Web3.utils.fromWei(nft.price, "ether")} ETH</p>
                    <button className="mt-4 w-full bg-sky-400 hover:bg-sky-600 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                  </div>
                </div>
              ))
            }
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
