import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Pic } from "../utils/interfaces"

export default function Home() {

  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if(index == 4) {
        setIndex(0)
      }
      else {
        setIndex(prev => prev + 1)
      }
    }, 3000)

    return () => clearInterval(interval)
  })

  const pics: Pic[] = [
    {
      name: "dancing",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 0 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`} src="/dancing.png" alt="dancing" width="700" height="700"></Image>
    },
    {
      name: "astronaut",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 1 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`} src="/astronaut.png" alt="astronaut" width="800" height="800"></Image>
    },
    {
      name: "no_bears",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 2 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`} src="/girl_no_bears.png" alt="no bears" width="700" height="700"></Image>
    },
    {
      name: "with_bear",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 3 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`} src="/cool_with_bear.png" alt="with bear" width="700" height="700"></Image>
    },
    {
      name: "real",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 4 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`} src="/real.png" alt="real" width="800" height="800"></Image>
    }
  ]
  
  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-[20%] left-[20%] py-4 font-acme">
        <h1 className="text-[4rem]">cooking up porridge for beras</h1>
        <h3 className="text-[1.5rem]">DAO governed defi infrastructure for Berachain</h3>
        <div className="mt-5 flex flex-row items-center">
          <Link href="https://goldilocks-1.gitbook.io/goldidocs/" target="_blank" >
            <button className="w-36 py-2 text-[1.2rem] bg-slate-200 hover:scale-[120%] rounded-xl" id="home-button">GoldiDOCS</button>
          </Link>
          <Link href="https://twitter.com/goldilocksmoney" target="_blank"><Image className="h-6 w-6 ml-6 rounded-3xl hover:opacity-25" src="/twitter.png" alt="twitter" id="card-div-shadow" width="25" height="25" /></Link>
        </div>
      </div>
      { pics[index].imageElement }
    </div>
  )
}