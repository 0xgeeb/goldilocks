"use client"

import { useState } from "react"
import { TradeChart, SideToggle } from "../../gamm"
import { RotatingImages } from "../../utils"

export const GammSideBox = () => {

  const [showChart, setShowChart] = useState<boolean>(false)

  const toggleChart = () => {
    setShowChart((prev) => !prev)
  }

  return (
    <>
      {
        !showChart ?
        <RotatingImages /> :
        <TradeChart />
      }
      <SideToggle showChart={showChart} toggleChart={toggleChart}/>
    </>
  )
}