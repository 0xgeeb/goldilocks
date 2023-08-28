"use client"

import { useState, useEffect } from "react"
import {
  useBorrowing,
  useWallet
} from "../../../providers"

export const StatsBox = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const { balance } = useWallet()

  const { 
    borrowInfo, 
    refreshBorrowInfo 
  } = useBorrowing()

  useEffect(() => {
    refreshBorrowInfo()
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small ml-3"></span>
  }

  const formatAsString = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
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

  return (
    <div className="w-[40%] h-[75%] bg-white border-2 border-black rounded-xl p-3 2xl:p-6 flex flex-col justify-around">
      <div className="flex flex-row justify-between items-center font-acme">
        <h1 className="text-[20px] 2xl:text-[24px]">$LOCKS floor price:</h1>
        <p className="text-[18px] 2xl:text-[20px]">{handleInfo(borrowInfo.fsl / borrowInfo.supply)}</p>
      </div>
      <div className="flex flex-row justify-between items-center font-acme">
        <h1 className="text-[20px] 2xl:text-[24px]">borrow limit:</h1>
        <p className="text-[18px] 2xl:text-[20px]">${handleInfo((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply))}</p>
      </div>
      <div className="flex flex-row justify-between items-center font-acme ">
        <h1 className="text-[20px] 2xl:text-[24px]">$LOCKS balance:</h1>
        <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.locks)}</p>
      </div>
      <div className="flex flex-row justify-between items-center font-acme">
        <h1 className="text-[20px] 2xl:text-[24px]">$HONEY balance:</h1>
        <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.honey)}</p>
      </div>
      <div className="flex flex-row justify-between items-center font-acme">
        <h1 className="text-[20px] 2xl:text-[24px]">borrowed $HONEY:</h1>
        <p className="text-[18px] 2xl:text-[20px]">{handleInfo(borrowInfo.borrowed)}</p>
      </div>
      <div className="flex flex-row justify-between items-center font-acme">
        <h1 className="text-[20px] 2xl:text-[24px]">staked $LOCKS:</h1>
        <p className="text-[18px] 2xl:text-[20px]">{handleInfo(borrowInfo.staked)}</p>
      </div>
      <div className="flex flex-row justify-between items-center font-acme">
        <h1 className="text-[20px] 2xl:text-[24px]">locked $LOCKS:</h1>
        <p className="text-[18px] 2xl:text-[20px]">{handleInfo(borrowInfo.locked)}</p>
      </div>
    </div>
  )
}