import React, { useEffect, useState } from "react"
import { useSpring, config, animated } from "@react-spring/web"
import coolWithBear from "../images/cool_with_bear.png"

export default function Bear() {

  const springs = useSpring({
    from: { scale: 0, y: 200, opacity: 0 },
    to: { scale: 1, y: 0, opacity: 1 },
  })

  return (
    <div className="w-[30%]">
      <animated.img style={springs} className="h-[70%] w-[36%] absolute bottom-0 right-0" src={coolWithBear} />
    </div>
  )
}