"use client"

import { useState, useEffect } from "react"
import { Pic } from "../../../utils/interfaces"

export const HomeImages = () => {

  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if(index == 3) {
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
      imageElement: (
        <img 
          className={`h-[60%] w-[50%] absolute right-0 bottom-0 ${index == 0 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} 
          src="/dancing.png" 
          alt="dancing"
          key="dancing"
          >
          </img>
      )
    },
    {
      name: "astronaut",
      imageElement: (
        <img 
          className={`h-[70%] w-[50%] absolute right-0 bottom-0 ${index == 1 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} 
          src="/astronaut.png" 
          alt="astronaut"
          key="astronaut"
        >
        </img>
      )
    },
    {
      name: "withbear",
      imageElement: (
        <img 
          className={`h-[70%] w-[50%] absolute right-0 bottom-0 ${index == 2 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} 
          src="/cool_with_bear.png" 
          alt="withbear"
          key="withbear"
        >
        </img>
      )
    },
    {
      name: "real",
      imageElement: (
        <img 
          className={`h-[70%] w-[50%] absolute right-0 bottom-0 ${index == 3 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} 
          src="/real.png" 
          alt="real"
          key="real"
        >
        </img>
      )
    }
  ]

  return <>{pics.map((pic) => pic.imageElement)}</>
}