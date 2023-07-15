"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Pic } from "../../../utils/interfaces"

export const RotatingImages = () => {

  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if(index == 3) {
        setIndex(0)
      }
      else {
        setIndex(prev => prev + 1)
      }
    }, 9000)

    return () => clearInterval(interval)
  })

  const pics: Pic[] = [
    {
      name: "dancing",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 0 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/dancing.png" alt="dancing" width="700" height="700"></Image>
    },
    {
      name: "astronaut",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 1 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/astronaut.png" alt="astronaut" width="800" height="800"></Image>
    },
    {
      name: "with_bear",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 2 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/cool_with_bear.png" alt="with bear" width="700" height="700"></Image>
    },
    {
      name: "real",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 3 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/real.png" alt="real" width="800" height="800"></Image>
    }
  ]

  return (
    <>
      { pics[0].imageElement }
      { pics[1].imageElement }
      { pics[2].imageElement }
      { pics[3].imageElement }
    </>
  )
}