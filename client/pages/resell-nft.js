import Web3 from 'web3'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import Modal from '../components/modal'
import { useEffect, useState } from 'react'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'

export default function ResellNFT() {
  const [price,setPrice] = useState(0);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const { id, image } = router.query 
  
  async function login() {
      const web3Modal = new Web3Modal()
      await web3Modal.connect()
      window.ethereum.request({method: 'eth_accounts'}).then((accounts)=> {
        if(accounts.length)
          setIsLogin(true)
      })
  }

  async function listNFTForSale() {
    if(price<=0) {
      alert('Price should be greater than 0.')
      return;
    }
    setLoading(true);
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
    }).on('error',(e)=>{
      setLoading(false)
      alert(e.message)
    })
  }

  useEffect(() => {
    if(window.ethereum)
      window.ethereum.request({method: 'eth_accounts'}).then(async (accounts)=> {
        if(accounts.length)
          setIsLogin(true)
      })
  },[])

  if(isLogin) {
  return (
    <>
    <div className="font-bold text-slate-500 rounded" style={{position:"absolute",left:"5px",top:"25px"}}>🟢</div>
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
