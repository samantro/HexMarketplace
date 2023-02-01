export default function Modal() {
  return (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="border-0 w-auto rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="relative p-6 pt-3 pb-3 flex-auto">
                    <p className="my-4 text-slate-500 text-xl leading-relaxed">
                        <div style={{margin:"auto"}}>
                            <img  className='animate-spin'src='https://www.svgrepo.com/show/199956/loading-loader.svg'
                                    style={{margin:"5px auto 5px auto",width:"60px",height:"60px"}
                                    }>
                            </img>
                            <div className="text-xl" style={{textAlign:"center"}}>Pending Transaction</div>
                        </div>
                    </p>
                </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
  )
}