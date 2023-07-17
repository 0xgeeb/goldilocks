"use client"

import { useEffect } from "react"
import { useGammMath, useFormatDate } from "../../../hooks/gamm"
import { useGamm } from "../../../providers"

//todo: clean this up
export const StatsBox = () => {

  const formatAsPercentage = Intl.NumberFormat('default', {
    style: 'percent',
    maximumFractionDigits: 2
  })

  const { floorPrice, marketPrice } = useGammMath()
  const { gammInfo, newInfo, refreshGammInfo } = useGamm()

  //todo: could be place to put loading symbols
  const fetchInfo = async () => {
    await refreshGammInfo()
  }

  useEffect(() => {
    fetchInfo()
  }, [])

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
          <p>${ floorPrice(gammInfo.fsl, gammInfo.supply) > 0 ? floorPrice(gammInfo.fsl, gammInfo.supply).toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
          <p>${ marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply) > 0 ? marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply).toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
          <p>{ gammInfo.fsl > 0 ? gammInfo.fsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
          <p>{ gammInfo.psl > 0 ? gammInfo.psl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
        </div>
        <div className="flex flex-col items-end justify-between">
          <p className={`${floorPrice(gammInfo.fsl, gammInfo.supply) > newInfo.floor ? "text-red-600" : floorPrice(gammInfo.fsl, gammInfo.supply) == newInfo.floor ? "" : "text-green-600"} font-acme text-[20px]`}>${ floorPrice(gammInfo.fsl, gammInfo.supply) == newInfo.floor ? "-" : newInfo.floor.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className={`${marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply) > newInfo.market ? "text-red-600" : marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply) == newInfo.market ? "" : "text-green-600"} font-acme text-[20px]`}>${ marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply) == newInfo.market ? "-" : newInfo.market.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className={`${gammInfo.fsl > newInfo.fsl ? "text-red-600" : gammInfo.fsl == newInfo.fsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ gammInfo.fsl == newInfo.fsl ? "-" : newInfo.fsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
          <p className={`${gammInfo.psl > newInfo.psl ? "text-red-600" : gammInfo.psl == newInfo.psl ? "" : "text-green-600"} font-acme text-[20px]`}>{ gammInfo.psl == newInfo.psl ? "-" : newInfo.psl.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="flex flex-row w-[40%] px-3 justify-between mr-3 rounded-xl border-2 border-black mt-2 bg-white">
        <div className="flex flex-col items-start justify-between w-[40%] font-acme text-[20px]">
          <h3>$LOCKS supply:</h3>
          <h3>target ratio:</h3>
          <h3>last floor raise:</h3>
        </div>
        <div className="flex flex-col items-end justify-between w-[30%]">
          <p className="font-acme text-[20px]">{ gammInfo.supply > 0 ? gammInfo.supply.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
          <p className="font-acme text-[20px] text-white">1,044</p>
          <p className="font-acme text-[20px] text-white">1,044</p>
        </div>
        <div className="flex flex-col items-end justify-between w-[30%]">
          <p className={`${gammInfo.supply > newInfo.supply ? "text-red-600" : gammInfo.supply == newInfo.supply ? "" : "text-green-600"} font-acme text-[20px]`}>{ gammInfo.supply == newInfo.supply ? "-" : newInfo.supply.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
          <p className="font-acme text-[20px]">{ gammInfo.targetRatio > 0 ? formatAsPercentage.format(gammInfo.targetRatio) : "-" }</p>
          <p className="font-acme text-[20px] whitespace-nowrap">{useFormatDate(gammInfo.lastFloorRaise * Math.pow(10, 21))}</p>
        </div>
      </div>
    </div>
  )
}