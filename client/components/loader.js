export default function LoaderComponent() {
    return (     
        <div style={{margin:"auto"}}>
            <img  className='animate-spin'src='https://www.svgrepo.com/show/199956/loading-loader.svg'
                    style={{margin:"200px auto 5px auto",width:"75px",height:"75px"}
                    }>
            </img>
            <div className="text-2xl" style={{textAlign:"center"}}>Loading NFTs</div>
        </div>
    )
}