import Web3 from 'web3'
import axios from 'axios';
import Web3Modal from 'web3modal'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import Footer from './footer';


export default function CreateItem() {
  const [nftUrl, setNftUrl] = useState(null)
  const [loading, setLoading] = useState(false);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()
  

  // upload image to IPFS
  async function onChange(e) {
    const file = e.target.files[0]

    try{
        const formData = new FormData();
        formData.append("file",file);
        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers:{
                'pinata_api_key':"0f2d063de18c8634c174",
                'pinata_secret_api_key':"64114ac2fb9e8870955f3f05cec9f176d56050235a369bce5b225243cea53760",
                'Content-Type':'multipart/form-data'
            },
        });
        const url = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        setNftUrl(url);
    } //end of try

    catch (error) {
      console.log('Error uploading file: ', error)
      alert ("!!!!! Error in on change - " + error)
    }  
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price) {
      return "";
    } else {
      const data = JSON.stringify({name,description,image: nftUrl})
      return data;
    }
  }

  async function listNFTForSale() {
    setLoading(true);
    const url = await uploadToIPFS();
    if(url=="") {
      alert('Please Upload your NFT image.')
      return;
    }
    const price = Web3.utils.toWei(formInput.price, "ether")

    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()

    // Mint the NFT
    const accounts = await web3.eth.getAccounts()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    let listingFee = await marketPlaceContract.methods.getListingFee().call()
    listingFee = listingFee.toString()

    marketPlaceContract.methods.listNft(url, price)
    .send({ from: accounts[0], value: listingFee }).on('receipt', function () {
        console.log('listed')
        router.push('/')
    });
  }

  return (
    <>
    <div className="flex justify-center bg-slate-100">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-10 mb-5 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mb-5 border rounded p-4 h-40"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          nftUrl && (
            <img className="rounded mt-4" width="350" src={nftUrl} />
          )
        }
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        
        <button disable={loading} onClick={listNFTForSale} className="font-bold mt-4 bg-teal-400 text-white rounded p-4 shadow-lg">
          MINT & LIST NFT
        </button>
      </div>
    </div>
    <Footer />
    </>
  )
}

