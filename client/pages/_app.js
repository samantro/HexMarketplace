import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  const navCss = "hover:scale-110 hover:text-blue-600 text-xl mr-6 mt-2 text-blue-500 font-bold";
  return (
    <div>
      <nav className="p-4">
        <div className="flex">
          <Link href="/">
            <a className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-black">HEX NFTs Marketplace</a>
          </Link>
          <Link href="/">
            <a className={`${navCss} ml-auto`}>
              Home
            </a>
          </Link>
          <Link href="/create-and-list-nft">
            <a className={`${navCss} `}>
              Create_NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className={`${navCss} `}>
              My_NFTs
            </a>
          </Link>
          <Link href="/my-listed-nfts">
            <a className={`${navCss} `}>
              My_Listed_NFTs
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps}/>
    </div>
  )
}

export default MyApp;
