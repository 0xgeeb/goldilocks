export const Products = () => {
  return (
    <div className="w-screen h-screen relative">
      <img
        className="h-[55%] w-[40%] lg:h-[60%] lg:w-[40%] absolute left-0 bottom-[15%] scale-x-[-1]"
        src="/real.png"
        alt="real"
      />
      <h1 className="absolute top-[15%] left-[43%] font-acme text-[3.5rem]">Goldilocks AMM (GAMM)</h1>
      <div className="absolute h-[16%] w-[42%] top-[24%] left-[43.5%] font-acme text-[1.5rem] flex flex-row justify-between">
        <div className="h-[100%] w-[30%] border-2 border-slate-700 rounded-md bg-white bg-grid-slate-200">
          <div className="h-[100%] flex flex-col justify-center items-center text-center rounded-md">
            <p>utilizes two</p>
            <p>liquidity pools</p>
          </div>
        </div>
        <div className="h-[100%] w-[30%] border-2 border-slate-700 rounded-md bg-white bg-grid-slate-200">
          <div className="h-[100%] flex flex-col justify-center items-center text-center rounded-md">
            <p>liquidity comprised</p>
            <p>of $HONEY</p>
          </div>
        </div>
        <div className="h-[100%] w-[30%] border-2 border-slate-700 rounded-md bg-white bg-grid-slate-200">
          <div className="h-[100%] flex flex-col justify-center items-center text-center rounded-md">
            <p>trade between</p>
            <p>$LOCKS & $HONEY</p>
          </div>
        </div>
      </div>
      <h1 className="absolute top-[56%] left-[43%] font-acme text-[3.5rem]">Goldilend</h1>
      <div className="absolute h-[16%] w-[42%] top-[65%] left-[43.5%] font-acme text-[1.5rem] flex flex-row justify-between">
        <div className="h-[100%] w-[30%] border-2 border-slate-700 rounded-md bg-white bg-grid-slate-200">
          <div className="h-[100%] flex flex-col justify-center items-center text-center rounded-md">
            <p>bong bera & rebase</p>
            <p>nft lending</p>
          </div>
        </div>
        <div className="h-[100%] w-[30%] border-2 border-slate-700 rounded-md bg-white bg-grid-slate-200">
          <div className="h-[100%] flex flex-col justify-center items-center text-center rounded-md">
            <p>LP $BERA</p>
            <p>to receive $gBERA</p>
          </div>
        </div>
        <div className="h-[100%] w-[30%] border-2 border-slate-700 rounded-md bg-white bg-grid-slate-200">
          <div className="h-[100%] flex flex-col justify-center items-center text-center rounded-md">
            <p>idle $BERA liquidity</p>
            <p>staked in Berachain</p>
          </div>
        </div>
      </div>
    </div>
  )
}