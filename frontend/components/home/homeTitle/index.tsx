import Image from "next/image"
import Link from "next/link"

export const HomeTitle = () => {

  return (
    <div className="absolute top-[30%] left-[11%] py-4 font-acme">
      <h1 className="text-[4rem]">cooking up porridge for beras</h1>
      <h3 className="text-[1.5rem]">DAO governed defi infrastructure for Berachain</h3>
      <div className="mt-5 flex flex-row items-center">
        <Link href="https://goldilocks-1.gitbook.io/goldidocs/" target="_blank" >
          <button className="w-36 py-2 text-[1.2rem] bg-slate-200 hover:scale-[120%] rounded-xl" id="home-button">GoldiDOCS</button>
        </Link>
        <Link href="https://twitter.com/goldilocksmoney" target="_blank"><Image className="h-6 w-6 ml-6 rounded-3xl hover:opacity-25" src="/twitter.png" alt="twitter" id="card-div-shadow" width="25" height="25" /></Link>
      </div>
    </div>
  )
}