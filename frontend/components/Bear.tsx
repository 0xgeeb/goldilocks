import React, { useEffect, useState } from "react"
import { Pic } from "../utils/interfaces"
import Image from "next/image"
import { useSpring, config, animated } from "@react-spring/web"

export default function Bear() {

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
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 0 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/dancing.png" alt="dancing" width="700" height="700"></Image>
    },
    {
      name: "astronaut",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 1 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/astronaut.png" alt="astronaut" width="800" height="800"></Image>
    },
    {
      name: "no_bears",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 2 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/girl_no_bears.png" alt="no bears" width="700" height="700"></Image>
    },
    {
      name: "with_bear",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 3 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/cool_with_bear.png" alt="with bear" width="700" height="700"></Image>
    },
    {
      name: "real",
      imageElement: <Image className={`absolute right-0 bottom-0 ${index == 4 ? "opacity-100 transition duration-1000 ease-in" : "opacity-0 transition duration-1000 ease-in"}`} src="/real.png" alt="real" width="800" height="800"></Image>
    }
  ]

  const springs = useSpring({
    from: { scale: 0, y: 200, opacity: 0 },
    to: { scale: 1, y: 0, opacity: 1 },
  })

  return (
    <animated.div style={springs} className="w-[30%]">
      <img className="h-[70%] w-[36%] absolute bottom-0 right-0" src={`/cool_with_bear.png`} />
    </animated.div>
  )
}