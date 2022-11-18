import { useState } from 'react'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'

//const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const client = ipfsHttpClient('https://hexnft.infura-ipfs.io:5001/api/v0')

import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import BoredPetsNFT from '../contracts/ethereum-contracts/BoredPetsNFT.json'

// new stuff
import axios from 'axios';
import { contractAddress,PINATA_KEY,PINATA_SECRET } from './config';


export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    // upload image to IPFS
    const file = e.target.files[0]
/*    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      //alert(" added path from onChange(): " + ${added.path})
      const url = `https://hexnft.infura-ipfs.io/ipfs/${added.path}`
      //const url = `https://ipfs.infura.io/ipfs/${added.path}`
      alert("url from onChange(): " + url)
      setFileUrl(url)
    } 
*/
     try{

            const formData = new FormData();
            formData.append("file",file);
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers:{
                    'pinata_api_key':PINATA_KEY,
                    'pinata_secret_api_key':PINATA_SECRET,
                    'Content-Type':'multipart/form-data'
                },
            });
            const url = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            alert("url onChange "+ url);
            //const ImageURL = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            setFileUrl(url);
    } //end of try

    catch (error) {
      console.log('Error uploading file: ', error)
      alert ("!!!!! Error in on change - " + error)
    }  
  }

   async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price ) {
      return
    } else {
      // first, upload metadata to IPFS
      const data = JSON.stringify({
        name, description, image: fileUrl
      })
      // alert("uploadToIPFS:beofre TRY name,description,price  = " + name + " " + description + " " + price  + " " + fileUrl);
      // alert("uploadToIPFS:beofre TRY data = " + data);
      //try {
        //alert('faking ipfx')
        /*const added = await client.add(data)
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        */
        //const url = `https://ipfs.infura.io/ipfs/}`        
        // after metadata is uploaded to IPFS, return the URL to use it in the transaction
        //return url
      //} 
         try{

            // const formData = new FormData();
            // formData.append("file",file);
            // const resFile = await axios({
            //     method: "post",
            //     url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            //     data: formData,
            //     headers:{
            //         'pinata_api_key':PINATA_KEY,
            //         'pinata_secret_api_key':PINATA_SECRET,
            //         'Content-Type':'multipart/form-data'
            //     },
            // });
            // const url = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            // const ImageURL = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            // setFileUrl(url);
            // alert("uploadToIPFS:end of TRY name,description,price  = " + name + " " + description + " " + price  + " " + fileUrl);
            // alert("uploadToIPFS:end of TRY data = " + data);
            // alert("URL from uploadToIPFS -" + fileUrl)
            return fileUrl;
        } //end of try
        catch (error) {
        console.log('Error uploading file: ', error)
        alert("Failure in uploadToIPFS -" + error)
      } 
    }
  }

  async function listNFTForSale() {
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const url = await uploadToIPFS()
    const networkId = await web3.eth.net.getId()

    // Mint the NFT
    const boredPetsContractAddress = BoredPetsNFT.networks[networkId].address
    const boredPetsContract = new web3.eth.Contract(BoredPetsNFT.abi, boredPetsContractAddress)
    const accounts = await web3.eth.getAccounts()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    let listingFee = await marketPlaceContract.methods.getListingFee().call()
    listingFee = listingFee.toString()
    // alert("url line 69 - " + url)
    // alert("account used for listing " + accounts[0])
    boredPetsContract.methods.mint(url).send({ from: accounts[0] }).on('receipt', function (receipt) {
        console.log('minted');
        // List the NFT
        const tokenId = receipt.events.NFTMinted.returnValues[0];
        marketPlaceContract.methods.listNft(boredPetsContractAddress, tokenId, Web3.utils.toWei(formInput.price, "ether"))
            .send({ from: accounts[0], value: listingFee }).on('receipt', function () {
                console.log('listed')
                router.push('/')
            });
    });
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-teal-400 text-white rounded p-4 shadow-lg">
          Mint and list NFT
        </button>
      </div>
    </div>
  )
}

