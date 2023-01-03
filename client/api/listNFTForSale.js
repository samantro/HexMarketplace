// const { useState } = require('react')
// const { useRouter } = require('next/router')
const Marketplace =  require('../../contracts/optimism-contracts/Marketplace.json');
const BoredPetsNFT =  require('../../contracts/optimism-contracts/BoredPetsNFT.json');
const Web3 =  require('web3');
const axios = require('axios')
let fileUrl;
var web3 = new Web3('https://rpc-mumbai.maticvigil.com')
// const {PINATA_KEY,PINATA_SECRET } = require('../pages/config.js');
const PINATA_KEY = "e75b77e4a23729c8e0f0";
const PINATA_SECRET = "668a2d0c24ba436f4d048edb0c73acdf3a8ac90fa1ad6fbe7d610490cb50dcf7";
  async function createIPFS(file) {
    // upload image to IPFS
     try{
            const formData = file;

            // create a json structure from incoming aurguments and replace with the formdata(line 31)

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
            // console.log("url onChange "+ url);
            return url;
        }
    catch (error) {
      console.log('Error uploading file: ', error)
     console.log("!!!!! Error in on change - " + error)
    }  
}

   async function uploadToIPFS(formInput) {
    const { name, description, price } = formInput
    if (!name || !description || !price ) {
      return
    } else {
      // first, upload metadata to IPFS
      const data = JSON.stringify({
        name, description, image: fileUrl
      })
      
         try{

            
            return fileUrl;
        } //end of try
        catch (error) {
        console.log('Error uploading file: ', error)
       console.log("Failure in uploadToIPFS -" + error)
      } 
    }
  }

  async function listNFTForSale(_address,data) {
    const formInput = { "price": data.price, "name": data.name, "description": data.description};
    // const router = useRouter()
    fileUrl = createIPFS(data.imageLink);
    const url = await uploadToIPFS(formInput)
    const networkId = await web3.eth.net.getId()

    // Mint the NFT
    const boredPetsContractAddress = BoredPetsNFT.networks[networkId].address
    const boredPetsContract = new web3.eth.Contract(BoredPetsNFT.abi, boredPetsContractAddress)
    // const accounts = await web3.eth.getAccounts()
    const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    let listingFee = await marketPlaceContract.methods.getListingFee().call()
    listingFee = listingFee.toString()
    // console.log("url line 69 - " + url)
    // console.log("account used for listing " + accounts[0])
    boredPetsContract.methods.mint(url).send({ from: _address }).on('receipt', function (receipt) {
        console.log('minted');
        // List the NFT
        const tokenId = receipt.events.NFTMinted.returnValues[0];
        marketPlaceContract.methods.listNft(boredPetsContractAddress, tokenId, Web3.utils.toWei(formInput.price, "ether"))
            .send({ from: _address, value: listingFee }).on('receipt', function () {
                console.log('listed')
                // router.push('/')
            });
    });
  }

  module.exports = {listNFTForSale}


