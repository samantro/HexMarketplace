import Web3 from 'web3'
import axios from 'axios';
import Web3Modal from 'web3modal'
import { useState,useEffect } from 'react'
import { useRouter } from 'next/router'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import Modal from '../components/modal';


export default function CreateItem() {
  const [nftUrl, setNftUrl] = useState(null)
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [metamask, setMetamask] = useState(false);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [fileName, setFileName] = useState('Select Image file');
  const router = useRouter()
  
  async function login() {
    if(!window.ethereum) {
      if(window.confirm('Please install Metamask to login')) {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en');
      }return;
    }
    if(window.ethereum) {
      const web3Modal = new Web3Modal()
      await web3Modal.connect()
      window.ethereum.request({method: 'eth_accounts'}).then((accounts)=> {
        if(accounts.length)
          setIsLogin(true)
      })
    }
  } 

  // upload image to IPFS
  async function onChange(e) {
    const file = e.target.files[0]
    setFileName(file.name);
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

      console.log('Error uploading file: ', error.message)
      alert ("!!!!! Error in on change - " + error)
    }  
  }

  function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price) {
      alert('Please fill all input.')
      return false;
    }
    else if (!nftUrl) {
      alert('Please Upload your NFT image.')
      return false;
    }
    else {
      const data = JSON.stringify({name,description,image: nftUrl})
      return data;
    }
  }

  async function listNFTForSale() {
    const data = uploadToIPFS();
    if(!data) {
      return;
    }
    setLoading(true);
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

    marketPlaceContract.methods.listNft(data, price)
    .send({ from: accounts[0], value: listingFee }).on('receipt', function () {
        console.log('listed')
        router.push('/')
    })
    .on('error', (err)=> {
      const msg = "MetaMask Tx Signature: User denied transaction signature.";
      if(err.message==msg) {
        setLoading(false);
      }
    })
  }


  useEffect(() => {
    if(window.ethereum) {
      setMetamask(true);
      window.ethereum.request({method: 'eth_accounts'}).then(async (accounts)=> {
        if(accounts.length) {
          setIsLogin(true)
        }
      })
    }
  },[])

if(metamask) {
  if(isLogin) {
    return (
      <>
      <div className='text-center'>
        <div className="font-bold text-slate-500 rounded" style={{position:"absolute",left:"5px",top:"25px"}}>🟢</div>
      </div>
      <div className="flex justify-center bg-slate-100">
        <div className="w-1/2 flex flex-col pt-2">
          <div className='m-auto'>
            {
              nftUrl && (
                <img className="rounded mt-4" width="350" src={nftUrl} />
              )
            }
            <label htmlFor='file' className='mt-2 mb-2' style={{display: "block",textAlign: "center"}}>{fileName}</label>
            <input
              type="file"
              name="Asset"
              id='file'
              className="my-4 ml-20"
              style={{display: "none"}}
              accept="image/*"
              onChange={onChange}
            />
          </div>
          <input 
            placeholder="Asset Name"
            value={formInput.name}
            className="mt-2 mb-5 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          />
          <textarea
            placeholder="Asset Description"
            value={formInput.description}
            className="mb-5 border rounded p-4 h-40"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />
          <input
            placeholder="Asset Price in Eth"
            value={formInput.price}
            className="border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
          
          <button disable={loading} onClick={listNFTForSale} className="font-bold mt-4 bg-teal-400 text-white rounded p-4 shadow-lg">
            MINT & LIST NFT
          </button>
        </div>
        {loading && Modal()}
      </div>
      </>
  )}

  else {
    return <div>
      <div className='text-center'>
        <div className='border shadow rounded-xl overflow-hidden m-auto mt-1' style={{width:"800px"}}>
            <h1 className="px-20 py-2 text-2xl" style={{textAlign:"center",color:"red"}}>You are not connected to Metamask
              <button className="m-auto mt-2 block bg-sky-400 hover:bg-sky-600 text-white py-1 px-4 rounded" onClick={login}> Connect</button>
            </h1>
            <div style={{position:"absolute",left:"5px",top:"25px"}} className="font-bold rounded hover:bg-teal-200">🔴</div>
          </div>
        </div>
    </div>
  }
}
else {
  return <div>
    <div className='text-center'>
      <div className='border shadow rounded-xl overflow-hidden m-auto mt-1' style={{width:"800px"}}>
          <h1 className="px-20 py-2 text-2xl" style={{textAlign:"center",color:"red"}}>
            <div>Please add
              <a className='hover:underline inline text-blue-700' target='_blank'
              href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"> MetaMask </a> extension to your browser.
            </div>
          </h1>
          <div style={{position:"absolute",left:"5px",top:"25px"}} className="font-bold rounded hover:bg-teal-200">🔴</div>
        </div>
      </div>
  </div>
}

}

