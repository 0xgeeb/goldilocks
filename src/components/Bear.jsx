import React, { useEffect, useState } from "react"
import coolWithBear from "../images/cool_with_bear.png"

export default function Bear() {
  return (
    <div className="w-[30%]">
      <img className="h-[70%] w-[36%] absolute bottom-0 right-0" src={coolWithBear} />
    </div>
  )
}