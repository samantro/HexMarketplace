import Web3 from 'web3'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import Footer from './footer'

export default function ResellNFT() {
  const [price,setPrice] = useState(0);
  const router = useRouter()
  const { id, image } = router.query  

  async function listNFTForSale() {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    let listingFee = await marketPlaceContract.methods.getListingFee().call()
    listingFee = listingFee.toString()
    const accounts = await web3.eth.getAccounts()
    marketPlaceContract.methods.resellNft(id, Web3.utils.toWei(price, "ether"))
      .send({ from: accounts[0], value: listingFee }).on('receipt', function () {
          router.push('/')
    });
  }

  return (
    <>
    <div className="flex justify-center bg-slate-100">
      <div className="w-1/2 flex flex-col pb-12">
        {image && (
          <img className="rounded mt-4" width="350" src={image} />    
        )}
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 mb-2 mr-4 border-2 border-sky-500 rounded p-4 w-64"
          onChange={e => setPrice(e.target.value)}
        /> 
        <button onClick={listNFTForSale} className="font-bold bg-teal-400 text-white rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
    <Footer />
    </>
  )
}
