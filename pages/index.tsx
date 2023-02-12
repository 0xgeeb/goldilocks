import Image from "next/image"
import Link from "next/link"

export default function Home() {

  return (
    <div className="100vh ">
      <div className="mt-[150px] ml-[330px] py-4">
        <h1 className="text-[65px] font-acme">distributing porridge to beras</h1>
        <h3 className="mt-1 text-[25px] font-acme">novel AMM, yield-splitting vaults, and native token & nft lending markets built on Berachain</h3>
        <div className="mt-5 flex flex-row items-center">
          <Link href="https://medium.com/@goldilocksmoney/goldidocs-1fe25dcb5cd2" target="_blank" >
            <button className="w-36 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl font-acme" id="home-button">more info</button>
          </Link>
          <Link href="https://twitter.com/goldilocksmoney" target="_blank"><Image className="h-6 w-6 ml-6 rounded-3xl hover:opacity-25" src="/twitter.png" alt="twitter" id="card-div-shadow" width="25" height="25" /></Link>
        </div>
      </div>
      <Image className="absolute left-2/3 bottom-0" src="/girl_no_bears.png" alt="girl_no_bears" width="500" height="500"></Image>
    </div>
  )
}