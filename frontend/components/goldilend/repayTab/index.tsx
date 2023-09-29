"use client"

import { useEffect, useState } from "react"
import { useGoldilend, useNotification, useWallet } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"

export const RepayTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const {
    // userLoans
  } = useGoldilend()

  const { openNotification } = useNotification()
  const { isConnected } = useWallet()

  useEffect(() => {
    // findLoans()
    setInfoLoading(false)
  }, [isConnected])





  return (
    <div className="w-[100%] h-[95%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[97.5%] flex flex-col py-4 px-6 border-2 border-black rounded-xl bg-white">
        <h1 className="font-acme pb-4 text-[24px] 2xl:text-[30px]">repay loan</h1>
        <div className="ml-2 mt-4">
          <h2 className="text-[18px] 2xl:text-[24px]">your loans</h2>
          {

          }
        </div>
      </div>
    </div>
  )
}