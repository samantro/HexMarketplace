import '../styles/globals.css'
import Link from 'next/link'
import Footer from '../components/footer';

function MyApp({ Component, props }) {
  const navCss = "hover:scale-110 hover:text-blue-600 text-xl mr-6 mt-2 text-blue-500 font-bold"; 

  return (
    <div>
      <nav className="p-4">
        <div className="flex">
          <Link href="/">
            <a className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ml-3 from-blue-600 to-black">HEX NFTs Marketplace</a>
          </Link>
          <Link href="/">
            <a className={`${navCss} ml-auto`}>
              Home
            </a>
          </Link>
          <Link href="/create-and-list-nft">
            <a className={`${navCss} `}>
              Create
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className={`${navCss} `} style={{wordSpacing:'-2px'}}>
              My NFTs
            </a>
          </Link>
          <Link href="/my-listed-nfts">
            <a className={`${navCss} `} style={{wordSpacing:'-2px'}}>
              Listed NFTs
            </a>
          </Link>
        </div>
      </nav>
      <Component {...props}/>
      <Footer />
    </div>
  )
}

export default MyApp;
