"use client"

import { useEffect, useState } from "react"
import { useGoldilend, useNotification, useWallet } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"

export const RepayTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const {
    goldilendInfo,
    findLoans
  } = useGoldilend()

  const { openNotification } = useNotification()
  const { isConnected } = useWallet()

  useEffect(() => {
    findLoans()
    setInfoLoading(false)
  }, [isConnected])

  return (
    <div className="h-[95%] mt-[2.5%] w-[100%] flex flex-col py-4 px-6 border-2 border-black rounded-xl bg-white font-acme">
      <h1 className="pb-4 text-[24px] 2xl:text-[30px]">repay loan</h1>
      <div className="w-[100%] h-[85%] bg-green-400 mt-2">
        <h2 className="ml-2 text-[18px] 2xl:text-[24px]">your loans</h2>
        <div className="w-[100%] h-[85%] mt-[3%] bg-green-200 flex flex-wrap overflow-y-auto" id="hide-scrollbar">
          {
            goldilendInfo.userLoans.map((loan, index) => (
              <div className="w-[100%] h-[35%] mb-[1%] bg-red-400" key={index}>
                loan
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}