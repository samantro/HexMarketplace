import Web3 from 'web3';
import Web3Modal from 'web3modal';
import {allNFTs} from '../salesforce/allNFTs'
import { useEffect, useState } from 'react';
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import LoaderComponent from '../components/loader';
import Modal from '../components/modal';
import { useRouter } from 'next/router'


export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [metamask, setMetamask] = useState(false);
  const router = useRouter()

  async function login() {
    const web3Modal = new Web3Modal()
    await web3Modal.connect()
    window.ethereum.request({method: 'eth_accounts'}).then((accounts)=> {
      if(accounts.length)
        setIsLogin(true)
    })
  }

  async function loadNFTs() {
    const nfts = await allNFTs();
    setNfts(nfts.filter(nft => nft !== null))
    setLoading(false)
  }

  async function buyNft(nft) {
    if(isLogin) {
      setBuyLoading(true);
      const web3Modal = new Web3Modal()
      const provider = await web3Modal.connect()
      const web3 = new Web3(provider)
      const networkId = await web3.eth.net.getId();
      const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
      const accounts = await web3.eth.getAccounts();
      marketPlaceContract.methods.buyNft(nft.tokenId).send({ from: accounts[0], value: nft.price }).then(()=> {
        router.push('/my-nfts')
      }).catch((err)=> {
        const msg = "MetaMask Tx Signature: User denied transaction signature.";
        if(err.message==msg) {
          alert(err.message);
        }
        else {
          alert('Transaction Failed: reverted by EVM')
          router.push('/');
        }
        setBuyLoading(false);
      })
    }
    else {
      alert("Please Connect to Metamask")
    }
  }

  useEffect(() => {
    loadNFTs()
    if(window.ethereum) {
      setMetamask(true);
      window.ethereum.request({method: 'eth_accounts'}).then(async (accounts)=> {
        if(accounts.length) {
          setIsLogin(true)
        }
      })
    }
  },[])

if(loading) {
  return LoaderComponent();
}
else
  if(!nfts.length) {
    return (<div><h1 className="px-20 py-10 text-3xl" style={{textAlign:"center",color:"grey"}}> No NFT available!</h1></div>)
  } 
  else {
    return (
      <>
        <div className='text-center'>
          {(isLogin) ? 
            <div className="font-bold text-slate-500 rounded" style={{position:"absolute",left:"5px",top:"25px"}}>🟢</div>
            :<div className='border shadow rounded-xl overflow-hidden m-auto mt-1' style={{width:"800px"}}>
              <h1 className="px-20 py-2 text-2xl" style={{textAlign:"center",color:"red"}}>
                {
                  (metamask) ? 
                    <div>You are not connected to Metamask
                      <button className="m-auto mt-2 block bg-sky-400 hover:bg-sky-600 text-white py-1 px-4 rounded" onClick={login}> Connect</button>
                    </div>:
                    <div>Please add
                      <a className='hover:underline inline text-blue-700' target='_blank'
                      href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"> MetaMask </a> extension to your browser.
                    </div>
                }
              </h1>
              <div style={{position:"absolute",left:"5px",top:"25px"}} className="font-bold rounded hover:bg-teal-200">🔴</div>
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
          {buyLoading && Modal()}
        </div>
      </>
    )
  }
}
