import Web3 from 'web3';
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import LoaderComponent from '../components/loader';

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
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
  
  function listNFT(nft) {
    router.push(`/resell-nft?id=${nft.tokenId}&image=${nft.image}`)
  }

  async function loadNFTs() {
    if(isLogin) {
      const web3Modal = new Web3Modal()
      const provider = await web3Modal.connect()
      const web3 = new Web3(provider)
      const networkId = await web3.eth.net.getId()
      const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
      const accounts = await web3.eth.getAccounts()
      const data = await marketPlaceContract.methods.getMyNfts().call({from: accounts[0]})
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
      setLoading(false)
    }
    else {
      alert("Please Connect to Metamask")
    }
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
  {loadNFTs()}
  if(loading) {
    return LoaderComponent();
  }
  else if (!nfts.length) {
    return (
      <div>
        <div className="font-bold text-slate-500 rounded" style={{position:"absolute",left:"5px",top:"25px"}}>🟢</div>
        <h1 className="px-20 py-10 text-3xl" style={{textAlign:"center",color:"grey"}}> No NFT Owned!</h1>
      </div>)
  } else {
    return (
      <>
        <div className="font-bold text-slate-500 rounded" style={{position:"absolute",left:"5px",top:"25px"}}>🟢</div>
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
      </>
    );
  }
}
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
