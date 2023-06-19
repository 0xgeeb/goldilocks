import Image from "next/image"

export const HomeNav = () => {

  return (
    <div className="w-[100%] flex flex-row items-center justify-between px-24 py-8">
      <a href="/"><div className="flex flex-row items-center hover:opacity-25">
        <Image className="" src="/yellow_transparent_logo.png" alt="logo" width="96" height="96" />
        <h1 className="text-[45px] ml-5 font-acme">Goldilocks v0.3</h1>
        <h3 className="text-[25px] ml-3 font-acme">(live on devnet)</h3>
      </div></a>
      <div className="flex flex-row">
        <a href="/gamm"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">gamm</button></a>
        <a href="/staking"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">stake</button></a>
        <a href="/borrowing"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">borrow</button></a>
      </div>
    </div>
  )
}