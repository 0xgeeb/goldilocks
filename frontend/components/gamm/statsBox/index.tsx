"use client"

import { useState, useEffect } from "react"
import { useGammMath, useFormatDate } from "../../../hooks/gamm"
import { useGamm } from "../../../providers"

export const StatsBox = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const formatAsPercentage = Intl.NumberFormat('default', {
    style: 'percent',
    maximumFractionDigits: 2
  })

  const formatAsString = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const { floorPrice, marketPrice } = useGammMath()
  const { gammInfo, newInfo, refreshGammInfo } = useGamm()

  useEffect(() => {
    refreshGammInfo()
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small ml-3"></span>
  }

  const handleInfo = (num: number) => {
    if(infoLoading) {
      return loadingElement()
    }
    else if(num > 0) {
      return formatAsString(num)
    }
    else {
      return "-"
    }
  }

  const handleRatioInfo = (num: number) => {
    if(infoLoading) {
      return loadingElement()
    }
    else if(num > 0) {
      return formatAsPercentage.format(num)
    }
    else {
      return "-"
    }
  }

  const handleColors = (num1: number, num2: number): string => {
    if(num1 > num2) {
      return 'text-red-600'
    }
    else if(num1 == num2) {
      return ''
    }
    else {
      return 'text-green-600'
    }
  }

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row w-[55%] px-3 ml-3 justify-between rounded-xl border-2 border-black mt-2 bg-white">
        <div className="flex flex-col items-start justify-between font-acme text-[24px]">
          <h3>$LOCKS floor price:</h3>
          <h3>$LOCKS market price:</h3>
          <h3>current fsl:</h3>
          <h3>current psl:</h3>
        </div>
        <div className="flex flex-col items-end justify-between font-acme text-[20px]">
          <p>${handleInfo(floorPrice(gammInfo.fsl, gammInfo.supply))}</p>
          <p>${handleInfo(marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply))}</p>
          <p>{handleInfo(gammInfo.fsl)}</p>
          <p>{handleInfo(gammInfo.psl)}</p>
        </div>
        <div className="flex flex-col items-end justify-between font-acme text-[20px]">
          <p 
            className={handleColors(floorPrice(gammInfo.fsl, gammInfo.supply), newInfo.floor)}
          >
            ${ floorPrice(gammInfo.fsl, gammInfo.supply) == newInfo.floor ? "-" : formatAsString(newInfo.floor)}
          </p>
          <p 
            className={handleColors(marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply), newInfo.market)}
          >
            ${ marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply) == newInfo.market ? "-" : formatAsString(newInfo.market)}
          </p>
          <p 
            className={handleColors(gammInfo.fsl, newInfo.fsl)}
          >
            {gammInfo.fsl == newInfo.fsl ? "-" : formatAsString(newInfo.fsl)}
          </p>
          <p 
            className={handleColors(gammInfo.psl, newInfo.psl)}
          >
            {gammInfo.psl == newInfo.psl ? "-" : formatAsString(newInfo.psl)}
          </p>
        </div>
      </div>
      <div className="flex flex-row w-[40%] px-3 justify-between mr-3 rounded-xl border-2 border-black mt-2 bg-white">
        <div className="flex flex-col items-start justify-between w-[40%] font-acme text-[20px]">
          <h3>$LOCKS supply:</h3>
          <h3>target ratio:</h3>
          <h3>last floor raise:</h3>
        </div>
        <div className="flex flex-col items-end w-[30%] font-acme text-[20px]">
          <p>{handleInfo(gammInfo.supply)}</p>
        </div>
        <div className="flex flex-col items-end justify-between w-[30%] font-acme text-[20px]">
          <p 
            className={handleColors(gammInfo.supply, newInfo.supply)}
          >
            {gammInfo.supply == newInfo.supply ? "-" : formatAsString(newInfo.supply)}
          </p>
          <p>{handleRatioInfo(gammInfo.targetRatio)}</p>
          <p 
            className="whitespace-nowrap"
          >
            {infoLoading ? loadingElement() : useFormatDate(gammInfo.lastFloorRaise * Math.pow(10, 21))}
          </p>
        </div>
      </div>
    </div>
  )
}