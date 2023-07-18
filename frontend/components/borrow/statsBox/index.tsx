"use client"

import { useEffect } from "react"
import {
  useBorrowing,
  useWallet
} from "../../../providers"

export const StatsBox = () => {

  const { balance } = useWallet()
  const { borrowInfo, refreshBorrowInfo } = useBorrowing()
  
  const fetchInfo = async () => {
    await refreshBorrowInfo()
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  return (
    <div className="w-[40%] h-[85%] bg-white border-2 border-black rounded-xl flex flex-col px-6 py-5">
      <div className="flex flex-row justify-between items-center">
        <h1 className="font-acme text-[24px]">borrow limit:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          ${borrowInfo.staked ? ((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)).toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          {(borrowInfo.fsl / borrowInfo.supply) > 0 ? `$${(borrowInfo.fsl / borrowInfo.supply).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : "-"}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          {balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          {borrowInfo.staked ? borrowInfo.staked.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "-"}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        <h1 className="font-acme text-[24px]">locked $LOCKS:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          {borrowInfo.locked > 0 ? borrowInfo.locked.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "-"}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        <h1 className="font-acme text-[24px]">$HONEY balance:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          {balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        <h1 className="font-acme text-[24px]">borrowed $HONEY:</h1>
        <p 
          className="font-acme text-[20px]"
        >
          {borrowInfo.borrowed > 0 ? borrowInfo.borrowed.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}
        </p>
      </div>
    </div>
  )
}