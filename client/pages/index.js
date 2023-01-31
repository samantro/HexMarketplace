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
  const [isLogin, setIsLogin] = useState(false);
  var web3=false;
  
  async function login() {
    // try {
      // if(window.ethereum) {
        setIsLogin(window.ethereum._state.accounts>0);
        if(!isLogin){
          const web3Modal = new Web3Modal()
          const provider = await web3Modal.connect()
          web3 = new Web3(provider)
          setIsLogin(window.ethereum._state.accounts>0);
        }
      // }
    // } catch(e) {
      // alert('Rejected: Metamask Login')
    // }
  }

  async function loadNFTs() {
    const nfts = await allNFTs();
    setNfts(nfts.filter(nft => nft !== null))
    setLoading(false)
  }

  async function buyNft(nft) {
    if(isLogin) {
      const web3Modal = new Web3Modal()
      const provider = await web3Modal.connect()
      const web3 = new Web3(provider)
      const networkId = await web3.eth.net.getId();
      const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
      const accounts = await web3.eth.getAccounts();
      await marketPlaceContract.methods.buyNft(nft.tokenId).send({ from: accounts[0], value: nft.price })
    }
    else {
      alert("Please Connect to Metamask")
    }
  }

  useEffect(() => {
    loadNFTs()
  },[])

if(loading) {
  return LoaderComponent();
}
else
  if(!nfts.length) {
    return (<div><h1 className="px-20 py-10 text-3xl" style={{textAlign:"center",color:"grey"}}> No NFT available!</h1><Footer /></div>)
  } 
  else {
    return (
      <>
        <div className='text-center'>
          {(isLogin) ? 
            <div className="font-bold text-slate-500 rounded" style={{position:"absolute",left:"410px",top:"30px"}}>🟢Connected</div>
            :<div className='border shadow rounded-xl overflow-hidden m-auto mt-1' style={{width:"800px"}}>
              <h1 className="px-20 py-2 text-2xl" style={{textAlign:"center",color:"red"}}>You are not connected to Metamask, Please
                <div style={{display:"inline", color:"blue"}} onClick={login}> connect</div>
              </h1>
              <div style={{position:"absolute",left:"410px",top:"30px"}} className="font-bold rounded hover:bg-teal-200">🔴Connect</div>
            </div>
          }
        </div>
        
        <div className="flex justify-center bg-slate-100 pb-15 mt-5">
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
